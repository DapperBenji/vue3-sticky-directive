# vue3-sticky-directive

vue3-sticky-directive is a powerful vue 3 directive make element sticky.

# Install

```Bash
npm install vue3-sticky-directive --save
```

```JavaScript
import { createApp } from 'vue'
import Sticky from 'vue3-sticky-directive'

const app = createApp({
   // ...
})
app.use(Sticky)
app.mount('#app')

Vue.use(Sticky)

```

# Usage

Use `v-sticky` directive to enable element postion sticky, and use `sticky-*` attributes to define its options. Sticky element will find its nearest element with `sticky-container` attribute or its parent node if faild as the releative element.

```HTML
<div sticky-container>
  <div v-sticky sticky-offset="offset" sticky-side="top">
    ...
  </div>
</div>
```

# Options
* `sticky-offset` - set sticky offset, it support a vm variable name or a js expression like `{top: 10, bottom: 20}`
  * `top`_(number)_ - set the top breakpoint (default: `0`)
  * `bottom`_(number)_ - set the bottom breakpoint (default: `0`)
* `sticky-side`_(string)_ - decide which side should be sticky, you can set `top`、`bottom` or `both` (default: `top`)
* `sticky-z-index` _(number)_ - to set the z-index of element to stick
* `on-stick` _(function)_ - callback when sticky and release, receiveing 1 argument with object indicating the state, like:

```javascript
// The element is sticked on top
{
  bottom: false,
  top: true,
  sticked: true
}
```

An expression that evaluates to false set on `v-sticky` can be used to disable stickiness condtionally.

```HTML
<div sticky-container>
  <div v-sticky="shouldStick">
    ...
  </div>
</div>
```
```JavaScript
export defaults {
  data () {
    shouldStick: false
  }
}
```

# License

MIT