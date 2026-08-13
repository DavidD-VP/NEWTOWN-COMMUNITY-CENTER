// Thin re-export so React.lazy can import the SharePage component as its own
// chunk.  The page now owns its own signal subscriptions and data graph;
// App.tsx renders it with no data props.
export { default } from './SharePage';
