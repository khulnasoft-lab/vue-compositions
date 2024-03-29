/* eslint-disable max-classes-per-file */
import { ref, Ref, watch } from 'vue'
import { SubscriptionChannel } from '@/useSubscription/models/channel'
import { RefreshChannelOptions } from '@/useSubscription/types'
import { Action, ActionResponse } from '@/useSubscription/types/action'
import { SubscriptionOptions } from '@/useSubscription/types/subscription'
import * as useSubscriptionDevtools from '@/useSubscription/useSubscriptionDevtools'

class SubscriptionIdManager {
  private static id: number = 0

  public static get(): number {
    return SubscriptionIdManager.id++
  }
}

export class Subscription<T extends Action> {
  public readonly id: number
  public readonly options: SubscriptionOptions
  public loading: Ref<boolean> = ref(false)
  public response: Ref<ActionResponse<T> | undefined> = ref(undefined)
  public errored: Ref<boolean> = ref(false)
  public error: Ref<unknown> = ref(null)
  public executed: Ref<boolean> = ref(false)
  public paused: Ref<boolean> = ref(false)
  public late: Ref<boolean> = ref(false)

  private readonly channel: SubscriptionChannel<T>

  public constructor(channel: SubscriptionChannel<T>, options: SubscriptionOptions) {
    this.id = SubscriptionIdManager.get()
    this.channel = channel
    this.options = options

    this.loading.value = channel.loading
    this.response.value = channel.response
    this.errored.value = channel.errored
    this.error.value = channel.error
    this.executed.value = channel.executed
  }

  public async refresh(options?: RefreshChannelOptions): Promise<void> {
    await this.channel.refresh(options)
  }

  public unsubscribe(): void {
    this.channel.unsubscribe(this.id)
    useSubscriptionDevtools.removeChannelSubscription(this.channel, this.id)
  }

  public isSubscribed(): boolean {
    return this.channel.isSubscribed(this.id)
  }

  public promise(): Promise<Subscription<T> & { response: Ref<ActionResponse<T>> }> {
    return new Promise((resolve, reject) => {
      if (this.isResolved()) {
        if (this.errored.value) {
          reject(this.error.value)
          return
        }


        resolve(this)
        return
      }

      const executedWatcher = watch(this.executed, () => {
        if (this.isResolved()) {
          erroredWatcher()
          executedWatcher()
          resolve(this)
        }
      })

      const erroredWatcher = watch(this.errored, () => {
        if (this.errored.value) {
          executedWatcher()
          erroredWatcher()
          reject(this.error.value)
        }
      })
    })
  }

  private isResolved(): this is { response: Ref<ActionResponse<T>> } {
    return this.executed.value
  }
}
