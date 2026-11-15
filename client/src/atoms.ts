import {atom} from 'jotai'
import { atomWithStorage } from 'jotai/utils'
import { type QueueItem } from '~/types/queue_item'

import {nanoid} from "nanoid";

export const nextRouteAtom = atom<string>('/')

export const rawQueueListAtom = atomWithStorage<QueueItem[]>('curateQueue', [], undefined, {getOnInit : true});

export const queueListAtom = atom(
    (get) => {
    return get(rawQueueListAtom);
    },
    (get, set, operation : string, value? : QueueItem[] | QueueItem ) => {
        if (operation === 'add') {
            if (!value) throw Error("Missing value in call to queueListAtom.set");

            if (! Array.isArray(value)) {
                value = [value];
            }

            for (let item of value) {
                if (! item.key_id) item.key_id = nanoid();
            }

            set(rawQueueListAtom, [...get(rawQueueListAtom), ...value]);
        }
        else if (operation === 'pop') {
            set(rawQueueListAtom, get(rawQueueListAtom).slice(1));
        }

        else if (operation === 'empty') {
            set(rawQueueListAtom, []);
        }

        else if (operation === 'remove') {
            if (!value) throw Error("Missing value in call to queueListAtom.set");

            const filter_value = Array.isArray(value) ? value[0] : value;

            const new_queue = get(rawQueueListAtom).filter(x => x.key_id !== filter_value.key_id);
            set(rawQueueListAtom, new_queue);

        }

        else throw Error(`Invalid operation '${operation} in call to queueListAtom.set`);
    }

);
