export interface State {
   isTopSticky: boolean | null
   isBottomSticky: boolean | null
   height: number | null
   width: number | null
   xOffset: number | null
   placeholderElRect?: DOMRect
   containerElRect?: DOMRect
}

export interface LastState {
   top: boolean | null
   bottom: boolean| null
   sticked: boolean | null
}

export interface Options {
   topOffset: number
   bottomOffset: number
   shouldTopSticky: boolean
   shouldBottomSticky: boolean
   zIndex: string
   onStick: (x: LastState) => void | null
}

export interface ElementStyle {
   paddingTop?: number | string
   position?: string
   top?: string
   bottom?: string
   left?: string
   width?: string
   zIndex?: string
}

export interface ElementClassName {
   'vue-sticky-el'?: boolean
   'top-sticky'?: boolean
   'bottom-sticky'?: boolean
   'vue-sticky-placeholder'?: boolean
}