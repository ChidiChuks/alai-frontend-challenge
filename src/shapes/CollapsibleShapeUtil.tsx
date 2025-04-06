import {
  Geometry2d,
  HTMLContainer,
  Rectangle2d,
  RecordProps,
  ShapeUtil,
  T,
  TLBaseShape,
} from "tldraw";
import { useLayoutEffect, useRef, useState } from "react";

export const COLLAPSED_HEIGHT = 50;
export const SHAPE_WIDTH = 200;

export type CollapsibleShape = TLBaseShape<
  "collapsible-container",
  {
    w: number;
    h: number;
    text: string;
    isExpanded: boolean;
    contentHeight?: number; // Store the measured content height
  }
>;

export class CollapsibleShapeUtil extends ShapeUtil<CollapsibleShape> {
  static override type = "collapsible-container" as const;

  static override props: RecordProps<CollapsibleShape> = {
    w: T.number,
    h: T.number,
    text: T.string,
    isExpanded: T.boolean,
    contentHeight: T.number,
  };

  getDefaultProps(): CollapsibleShape["props"] {
    return {
      w: SHAPE_WIDTH,
      h: COLLAPSED_HEIGHT,
      text: "",
      isExpanded: false,
      contentHeight: COLLAPSED_HEIGHT,
    };
  }

  getGeometry(shape: CollapsibleShape): Geometry2d {
    return new Rectangle2d({
      width: shape.props.w,
      height: shape.props.h,
      isFilled: true,
    });
  }

  component(shape: CollapsibleShape) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [contentHeight, setContentHeight] = useState<number>(
      shape.props.contentHeight || COLLAPSED_HEIGHT
    );

    useLayoutEffect(() => {
      if (containerRef.current) {
        const newHeight = containerRef.current.scrollHeight;
        if (newHeight !== contentHeight) {
          setContentHeight(newHeight);
          // Update the shape with the new content height
          this.editor?.updateShape({
            id: shape.id,
            type: "collapsible-container",
            props: {
              ...shape.props,
              contentHeight: newHeight,
              h: shape.props.isExpanded ? newHeight : COLLAPSED_HEIGHT,
            },
          });
        }
      }
    }, [shape.props.text]);

    const style: React.CSSProperties = {
      width: "100%",
      height: "100%",
      backgroundColor: "#ffffff",
      border: "1px solid #000000",
      padding: "8px",
      borderRadius: "4px",
      overflow: "hidden",
      transition: "height 0.3s ease-in-out",
      cursor: "pointer",
    };

    return (
      <HTMLContainer style={style}>
        <div ref={containerRef} style={{ width: "100%" }}>
          {shape.props.text}
        </div>
      </HTMLContainer>
    );
  }

  indicator(shape: CollapsibleShape) {
    return <rect width={shape.props.w} height={shape.props.h} />;
  }
}
