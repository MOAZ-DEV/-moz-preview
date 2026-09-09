import type { RefObject } from "react";
import {
  ReactInfiniteCanvas,
  type ReactInfiniteCanvasHandle,
} from "react-infinite-canvas";

import type { CanvasItem } from "../types";
import Viewport from "./viewport";

type InfiniteCanvasProps = {
  data: CanvasItem[];
  ref?: RefObject<ReactInfiniteCanvasHandle | null>;
};

export default function InfiniteCanvas({ data, ref }: InfiniteCanvasProps) {
  return (
    <ReactInfiniteCanvas ref={ref}>
      <div>
        {data.map((item) => (
          <Viewport
            {...item}
            style={{
              position: "absolute",
              left: item.position.x,
              top: item.position.y,
              width: item.size.width,
              height: item.size.height,
              overflow: "hidden",
            }}
            className="border rounded-2xl!"
          />
          /*<div
            key={item.id}
          >
            {item.element}
          </div>*/
        ))}
      </div>
    </ReactInfiniteCanvas>
  );
}
