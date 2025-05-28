import * as React from "react"

import { ToastActionElement, ToastProps } from "@/components/ui/toast"

const TOAST_LIMIT = 1
const TOAST_REMOVE_DELAY = 1000000 // Keep toast visible until manually dismissed for UI testing

type ToasterToast = ToastProps & {
    id: string
    title?: React.ReactNode
    description?: React.ReactNode
    action?: ToastActionElement
}

const actionTypes = {
    ADD_TOAST: "ADD_TOAST",
    UPDATE_TOAST: "UPDATE_TOAST",
    DISMISS_TOAST: "DISMISS_TOAST",
    REMOVE_TOAST: "REMOVE_TOAST",
}

let count = 0

function genId() {
    count = (count + 1) % Number.MAX_SAFE_INTEGER
    return count.toString()
}

type Action =
    | {
        type: typeof actionTypes.ADD_TOAST
        toast: ToasterToast
    }
    | {
        type: typeof actionTypes.UPDATE_TOAST
        toast: Partial<ToasterToast>
    }
    | {
        type: typeof actionTypes.DISMISS_TOAST
        toastId?: ToasterToast["id"]
    }
    | {
        type: typeof actionTypes.REMOVE_TOAST
        toastId?: ToasterToast["id"]
    }

interface State {
    toasts: ToasterToast[]
}

const reducer = (state: State, action: Action) => {
    switch (action.type) {
        case actionTypes.ADD_TOAST:
            return {
                ...state,
                toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
            }

        case actionTypes.UPDATE_TOAST:
            return {
                ...state,
                toasts: state.toasts.map((t) =>
                    t.id === action.toast.id ? { ...t, ...action.toast } : t
                ),
            }

        case actionTypes.DISMISS_TOAST:
            const { toastId } = action

            // ! Side effects ! - clean up timeout
            if (toastId) {
                // clearDismissTimer(toastId)
            }

            return {
                ...state,
                toasts: state.toasts.map((t) =>
                    t.id === toastId ? { ...t, open: false } : t
                ),
            }

        case actionTypes.REMOVE_TOAST:
            const { toastId: removeToastId } = action

            if (removeToastId) {
                return {
                    ...state,
                    toasts: state.toasts.filter((t) => t.id !== removeToastId),
                }
            }

            return {
                ...state,
                toasts: [],
            }
        default:
            return state
    }
}

const listeners: ((state: State) => void)[] = []

let memoryState: State = { toasts: [] }

function dispatch(action: Action) {
    memoryState = reducer(memoryState, action)
    listeners.forEach((listener) => {
        listener(memoryState)
    })
}

type Toast = Omit<ToasterToast, "id">

function toast({ ...props }: Toast) {
    const id = genId()

    const update = (props: Partial<ToasterToast>) =>
        dispatch({
            type: actionTypes.UPDATE_TOAST,
            toast: { ...props, id },
        })
    const dismiss = () => dispatch({ type: actionTypes.DISMISS_TOAST, toastId: id })

    dispatch({
        type: actionTypes.ADD_TOAST,
        toast: {
            ...props,
            id,
            open: true,
            onOpenChange: (open) => {
                if (!open) dismiss()
            },
        },
    })

    return {
        id: id,
        dismiss,
        update,
    }
}

function useToast() {
    const [state, setState] = React.useState<State>(memoryState)

    React.useEffect(() => {
        listeners.push(setState)
        return () => {
            const index = listeners.indexOf(setState)
            if (index > -1) {
                listeners.splice(index, 1)
            }
        }
    }, [state])

    return {
        ...state,
        toast,
        dismiss: React.useCallback(() => dispatch({ type: actionTypes.DISMISS_TOAST }), []),
    }
}

export { useToast, toast } 