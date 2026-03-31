ID: 202603290  
Tags: #react #performance

### Core idea

Windowing (also called virtual scrolling) renders only the visible items in a list, not all of them. As the user scrolls, items outside the viewport are removed from the DOM and new ones are added. This keeps DOM size small regardless of list length.

### Why it matters

- Lists with thousands of items can freeze the browser without windowing
- DOM operations are expensive; fewer nodes means faster renders and scrolling
- Memory usage stays low even with large datasets
- Users perceive smooth scrolling instead of lag or jank

### Key concepts

1. Virtual list  
   A component that renders only the items currently visible in the scrollable container. Maintains the illusion of a full list using container height and absolute positioning.

2. Overscan  
   Rendering a few extra items above and below the visible area. Prevents a flash of empty space when scrolling quickly.

3. Item height  
   Fixed-height items are easier to calculate. Variable-height items require measurement, which is more complex to implement.

4. Scrollable container  
   The parent element with a fixed height and overflow: auto or overflow: scroll. Items are positioned absolutely inside it.

5. react-window  
   A lightweight library for fixed-size lists and grids. Minimal API, small bundle.

6. react-virtual (TanStack Virtual)  
   More flexible than react-window. Supports dynamic item heights, horizontal scrolling, and virtualized grids. Framework-agnostic.

### Insight

Windowing is unnecessary for lists under 100-200 items. Add it only when you profile and confirm the list is causing performance problems. The complexity it adds is not worth it for small lists.

### Examples

1. Fixed-size list with react-window
```javascript
import { FixedSizeList } from 'react-window'

const Row = ({ index, style }) => (
  <div style={style}>Row {index}</div>
)

function VirtualList({ items }) {
  return (
    <FixedSizeList
      height={500}
      itemCount={items.length}
      itemSize={50}
      width="100%"
    >
      {Row}
    </FixedSizeList>
  )
}
```

2. Passing data to rows with itemData
```javascript
import { FixedSizeList } from 'react-window'

const Row = ({ index, style, data }) => (
  <div style={style}>{data[index].name}</div>
)

function UserList({ users }) {
  return (
    <FixedSizeList
      height={600}
      itemCount={users.length}
      itemSize={60}
      itemData={users}
      width="100%"
    >
      {Row}
    </FixedSizeList>
  )
}
```

3. Variable-height list with TanStack Virtual
```javascript
import { useVirtualizer } from '@tanstack/react-virtual'
import { useRef } from 'react'

function DynamicList({ items }) {
  const parentRef = useRef(null)

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 80,
    overscan: 5
  })

  return (
    <div ref={parentRef} style={{ height: '500px', overflow: 'auto' }}>
      <div style={{ height: virtualizer.getTotalSize() }}>
        {virtualizer.getVirtualItems().map(item => (
          <div
            key={item.key}
            style={{
              position: 'absolute',
              top: item.start,
              left: 0,
              width: '100%'
            }}
          >
            {items[item.index].name}
          </div>
        ))}
      </div>
    </div>
  )
}
```

4. Fixed-size grid with react-window
```javascript
import { FixedSizeGrid } from 'react-window'

const Cell = ({ columnIndex, rowIndex, style }) => (
  <div style={style}>
    Row {rowIndex}, Col {columnIndex}
  </div>
)

function Grid() {
  return (
    <FixedSizeGrid
      columnCount={10}
      columnWidth={100}
      height={500}
      rowCount={1000}
      rowHeight={50}
      width={800}
    >
      {Cell}
    </FixedSizeGrid>
  )
}
```

### Common patterns

- Use react-window for simple fixed-height lists
- Use TanStack Virtual for dynamic heights or complex use cases
- Add overscan of 3-5 items to reduce blank flashes during fast scrolling
- Memoize row components with React.memo to avoid re-rendering all visible rows on each scroll
- Combine with pagination or infinite scroll for server-side data

### Common mistakes

- Applying windowing to short lists where regular rendering is faster
- Forgetting to pass the style prop to each row (breaks positioning)
- Using absolute positioned items without setting the total height on the container
- Not memoizing the Row component, causing all visible items to re-render on scroll
- Measuring item height inside the row component on every render instead of caching it
