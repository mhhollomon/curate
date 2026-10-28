import {atom} from 'jotai'
import { atomWithStorage } from 'jotai/utils'
import { type QueueItem } from '~/types/queue_item'

export const nextRouteAtom = atom<string>('/')

export const queueListAtom = atomWithStorage<QueueItem[]>('curateQueue', [], undefined, {getOnInit : true})