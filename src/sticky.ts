import { ComponentPublicInstance } from 'vue'
import { State, LastState, Options, ElementStyle, ElementClassName } from './types'

type stickySide = 'top' | 'bottom' | 'both'

const namespace = '@@vue3-sticky-directive'
const events = [
   'resize',
   'scroll',
   'touchstart',
   'touchmove',
   'touchend',
   'pageshow',
   'load'
]

const batchStyle = (el: HTMLElement, style: ElementStyle = {}, className: ElementClassName = {}): void => {
   for (let k in style) {
      el.style[k] = style[k]
   }
   for (let k in className) {
      if (className[k] && !el.classList.contains(k)) {
         el.classList.add(k)
      } else if (!className[k] && el.classList.contains(k)) {
         el.classList.remove(k)
      }
   }
}

class Sticky {
   el: HTMLElement
   vm: any// ComponentPublicInstance
   unSubscribers: Array<()=> void>
   isPending: boolean
   state: State
   lastState: LastState
   options: Options
   placeholderEl?: HTMLElement
   containerEl?: HTMLElement | null

   constructor (el: HTMLElement, vm: ComponentPublicInstance) {
      this.el = el
      this.vm = vm
      this.unSubscribers = []
      this.isPending = false
      this.state = {
         isTopSticky: null,
         isBottomSticky: null,
         height: null,
         width: null,
         xOffset: null
      }

      this.lastState = {
         top: null,
         bottom: null,
         sticked: false
      }

      const offset = this.getAttribute('sticky-offset') || {}
      const side: stickySide = this.getAttribute('sticky-side') || 'top'
      const zIndex: string = this.getAttribute('sticky-z-index') || '10'
      const onStick = this.getAttribute('on-stick') || null

      this.options = {
         topOffset: Number(offset.top) || 0,
         bottomOffset: Number(offset.bottom) || 0,
         shouldTopSticky: side === 'top' || side === 'both',
         shouldBottomSticky: side === 'bottom' || side === 'both',
         zIndex: zIndex,
         onStick: onStick
      }
   }

   doBind(): void {
      if (this.unSubscribers.length > 0) {
         return
      }

      const { el, vm } = this
      vm.$nextTick(() => {
         this.placeholderEl = document.createElement('div')
         this.containerEl = this.getContainerEl()
         el.parentElement!.insertBefore(this.placeholderEl, el)
         events.forEach(event => {
            const fn = this.update.bind(this)
            this.unSubscribers.push(() => window.removeEventListener(event, fn))
            this.unSubscribers.push(() =>
               this.containerEl!.removeEventListener(event, fn)
            )
            window.addEventListener(event, fn, { passive: true })
            this.containerEl!.addEventListener(event, fn, { passive: true })
         })
      })
   }

   doUnbind(): void {
      this.unSubscribers.forEach(fn => fn())
      this.unSubscribers = []
      this.resetElement()
   }

   update(): void {
      if (!this.isPending) {
         requestAnimationFrame(() => {
            this.isPending = false
            this.recomputeState()
            this.updateElements()
         })
         this.isPending = true
      }
   }

   isTopSticky(): boolean {
      if (!this.options.shouldTopSticky) return false
      const fromTop = this.state.placeholderElRect!.top
      const fromBottom = this.state.containerElRect!.bottom

      const topBreakpoint = this.options.topOffset
      const bottomBreakpoint = this.options.bottomOffset

      return fromTop <= topBreakpoint && fromBottom >= bottomBreakpoint
   }

   isBottomSticky(): boolean {
      if (!this.options.shouldBottomSticky) return false
      const fromBottom =
         window.innerHeight - this.state.placeholderElRect!.top - this.state.height!
      const fromTop = window.innerHeight - this.state.containerElRect!.top

      const topBreakpoint = this.options.topOffset
      const bottomBreakpoint = this.options.bottomOffset

      return fromBottom <= bottomBreakpoint && fromTop >= topBreakpoint
   }

   recomputeState(): void {
      this.state = Object.assign({}, this.state, {
         height: this.getHeight(),
         width: this.getWidth(),
         xOffset: this.getXOffset(),
         placeholderElRect: this.getPlaceholderElRect(),
         containerElRect: this.getContainerElRect()
      })
      this.state.isTopSticky = this.isTopSticky()
      this.state.isBottomSticky = this.isBottomSticky()
   }

   fireEvents(): void {
      if (
         typeof this.options.onStick === 'function' &&
         (this.lastState.top !== this.state.isTopSticky ||
         this.lastState.bottom !== this.state.isBottomSticky ||
         this.lastState.sticked !==
            (this.state.isTopSticky || this.state.isBottomSticky))
      ) {
         this.lastState = {
            top: this.state.isTopSticky,
            bottom: this.state.isBottomSticky,
            sticked: this.state.isBottomSticky || this.state.isTopSticky
         }
         this.options.onStick(this.lastState)
      }
   }

   updateElements(): void {
      const placeholderStyle: ElementStyle = {
         paddingTop: 0
      }
      const elStyle: ElementStyle = {
         position: 'static',
         top: 'auto',
         bottom: 'auto',
         left: 'auto',
         width: 'auto',
         zIndex: this.options.zIndex
      }
      const placeholderClassName: ElementClassName = {
         'vue-sticky-placeholder': true
      }
      const elClassName: ElementClassName = {
         'vue-sticky-el': true,
         'top-sticky': false,
         'bottom-sticky': false
      }

      if (this.state.isTopSticky) {
         elStyle.position = 'fixed'
         elStyle.top = this.options.topOffset + 'px'
         elStyle.left = this.state.xOffset + 'px'
         elStyle.width = this.state.width + 'px'
         const bottomLimit =
            this.state.containerElRect!.bottom -
            this.state.height! -
            this.options.bottomOffset -
            this.options.topOffset

         if (bottomLimit < 0) {
            elStyle.top = bottomLimit + this.options.topOffset + 'px'
         }

         placeholderStyle.paddingTop = this.state.height + 'px'
         elClassName['top-sticky'] = true
      } else if (this.state.isBottomSticky) {
         elStyle.position = 'fixed'
         elStyle.bottom = this.options.bottomOffset + 'px'
         elStyle.left = this.state.xOffset + 'px'
         elStyle.width = this.state.width + 'px'
         const topLimit =
            window.innerHeight -
            this.state.containerElRect!.top -
            this.state.height! -
            this.options.bottomOffset -
            this.options.topOffset

         if (topLimit < 0) {
            elStyle.bottom = topLimit + this.options.bottomOffset + 'px'
         }

         placeholderStyle.paddingTop = this.state.height + 'px'
         elClassName['bottom-sticky'] = true
      } else {
         placeholderStyle.paddingTop = 0
      }

      batchStyle(this.el, elStyle, elClassName)
      batchStyle(this.placeholderEl!, placeholderStyle, placeholderClassName)

      this.fireEvents()
   }

   resetElement(): void {
      ['position', 'top', 'bottom', 'left', 'width', 'zIndex'].forEach(attr => {
         this.el.style.removeProperty(attr)
      })
      this.el.classList.remove('bottom-sticky', 'top-sticky')
      const { parentElement } = this.placeholderEl!
      if (parentElement) {
         parentElement.removeChild(this.placeholderEl!)
      }
   }

   getContainerEl(): HTMLElement | null {
      let node = this.el.parentElement
      while (
         node &&
         node.tagName !== 'HTML' &&
         node.tagName !== 'BODY' &&
         node.nodeType === 1
      ) {
         if (node.hasAttribute('sticky-container')) {
            return node
         }
         node = node.parentElement
      }
      return this.el.parentElement
   }

   getXOffset(): number {
      return this.placeholderEl!.getBoundingClientRect().left
   }

   getWidth(): number {
      return this.placeholderEl!.getBoundingClientRect().width
   }

   getHeight(): number {
      return this.el.getBoundingClientRect().height
   }

   getPlaceholderElRect(): DOMRect {
      return this.placeholderEl!.getBoundingClientRect()
   }

   getContainerElRect(): DOMRect {
      return this.containerEl!.getBoundingClientRect()
   }

   getAttribute(name: string) {
      const expr = this.el.getAttribute(name)
      let result
      if (expr) {
         if (this.vm[expr]) {
            result = this.vm[expr]
         } else {
            try {
               result = eval(`(${expr})`)
            } catch (error) {
               result = expr
            }
         }
      }
      return result
   }
}

export default {
   mounted (el: any, binding: any) {
      if (typeof binding.value === 'undefined' || binding.value) {
         el[namespace] = new Sticky(el, binding.instance)
         el[namespace].doBind()
      }
   },
   unmounted (el: any) {
      if (el[namespace]) {
         el[namespace].doUnbind()
         el[namespace] = undefined
      }
   },
   updated (el: any, binding: any) {
      if (typeof binding.value === 'undefined' || binding.value) {
         if (!el[namespace]) {
            el[namespace] = new Sticky(el, binding.instance)
         }
         el[namespace].doBind()
      } else {
         if (el[namespace]) {
            el[namespace].doUnbind()
         }
      }
   }
}
