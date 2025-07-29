# SAFARI vs CHROME iOS - VIEWPORT DIFFERENCES

## 1. CSS Viewport Units

```css
/* Safari iOS */
height: 100vh; /* = Document height (không đổi) */
height: 100dvh; /* = Dynamic height (thay đổi) - BUG PRONE */

/* Chrome iOS */
height: 100vh; /* = Viewport height (chính xác) */
height: 100dvh; /* = Dynamic height (stable) */
```

## 2. JavaScript Viewport API

```javascript
// Safari iOS
window.innerHeight; // Thay đổi khi keyboard xuất hiện
window.visualViewport; // Không đầy đủ support
document.documentElement.clientHeight; // Không thay đổi

// Chrome iOS
window.visualViewport.height; // Chính xác và stable
window.innerHeight; // Đồng bộ với visualViewport
```

## 3. Layout Calculation

```
Safari iOS:
- Body height = 100vh = 800px (fixed)
- Container height = window.innerHeight = 400px (when keyboard open)
- Result: 400px empty space

Chrome iOS:
- Body height auto-adjusts với visualViewport
- Container height = visualViewport.height = 400px
- Result: No empty space
```

## 4. Event Handling

```javascript
// Safari iOS
window.addEventListener("resize", handler); // Unreliable
visualViewport.addEventListener("resize", handler); // Limited support

// Chrome iOS
visualViewport.addEventListener("resize", handler); // Perfect support
```
