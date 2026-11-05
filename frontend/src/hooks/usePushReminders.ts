import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY as string | undefined

type ReminderStatus = 'unsupported' | 'needs-install' | 'off' | 'on' | 'blocked'

function urlBase64ToUint8Array(base64: string): Uint8Array<ArrayBuffer> {
  const padded = (base64 + '='.repeat((4 - (base64.length % 4)) % 4)).replace(/-/g, '+').replace(/_/g, '/')
  const raw = atob(padded)
  const bytes = new Uint8Array(new ArrayBuffer(raw.length))
  for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i)
  return bytes
}

function isIosBrowserTab(): boolean {
  const isIos = /iPhone|iPad|iPod/.test(navigator.userAgent)
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches
  return isIos && !isStandalone
}

function isPushSupported(): boolean {
  return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window && Boolean(VAPID_PUBLIC_KEY)
}

export function usePushReminders(isEnabled: boolean) {
  const [status, setStatus] = useState<ReminderStatus>('off')
  const [isBusy, setIsBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isEnabled) return
    const check = async () => {
      if (isIosBrowserTab()) return setStatus('needs-install')
      if (!isPushSupported()) return setStatus('unsupported')
      if (Notification.permission === 'denied') return setStatus('blocked')
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.getSubscription()
      setStatus(subscription ? 'on' : 'off')
    }
    void check()
  }, [isEnabled])

  async function enable() {
    if (!supabase || !VAPID_PUBLIC_KEY) return
    setIsBusy(true)
    setError(null)
    try {
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') {
        setStatus(permission === 'denied' ? 'blocked' : 'off')
        return
      }
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      })
      const json = subscription.toJSON()
      const { error: saveError } = await supabase.from('push_subscriptions').upsert({
        endpoint: subscription.endpoint,
        p256dh: json.keys?.p256dh ?? '',
        auth: json.keys?.auth ?? '',
      })
      if (saveError) {
        await subscription.unsubscribe()
        throw saveError
      }
      setStatus('on')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not turn on reminders.')
    } finally {
      setIsBusy(false)
    }
  }

  async function disable() {
    setIsBusy(true)
    setError(null)
    try {
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.getSubscription()
      if (subscription) {
        await supabase?.from('push_subscriptions').delete().eq('endpoint', subscription.endpoint)
        await subscription.unsubscribe()
      }
      setStatus('off')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not turn off reminders.')
    } finally {
      setIsBusy(false)
    }
  }

  return { status, isBusy, error, enable, disable }
}
