import * as React from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence, PanInfo } from "framer-motion";

interface BottomSheetProps {
  open: boolean;
  onOpenChange?: (open: boolean) => void;
  snapPoints?: number[];
  defaultSnapPoint?: number;
  children?: React.ReactNode;
  className?: string;
  overlayClassName?: string;
  handleClassName?: string;
}

const BottomSheet = React.forwardRef<
  HTMLDivElement,
  BottomSheetProps
>(
  (
    {
      open,
      onOpenChange,
      snapPoints = [0.5, 0.9],
      defaultSnapPoint = 0,
      children,
      className,
      overlayClassName,
      handleClassName,
      ...props
    },
    ref
  ) => {
    const sheetRef = React.useRef<HTMLDivElement>(null);
    const contentRef = React.useRef<HTMLDivElement>(null);
    const isDragging = React.useRef(false);
    const startY = React.useRef(0);
    const [currentSnapPoint, setCurrentSnapPoint] = React.useState(defaultSnapPoint);
    const [sheetHeight, setSheetHeight] = React.useState(0);

    React.useEffect(() => {
      if (sheetRef.current) {
        setSheetHeight(sheetRef.current.scrollHeight);
      }
    }, [open, children]);

    const getYPosition = (snapPointIndex: number) => {
      if (!snapPoints || snapPointIndex < 0 || snapPointIndex >= snapPoints.length) {
        return 0;
      }
      const vh = window.innerHeight;
      const snapPoint = snapPoints[snapPointIndex];
      return vh - (vh * snapPoint);
    };

    const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      const { velocity, offset } = info;
      const currentPosition = getYPosition(currentSnapPoint);
      const currentOffset = currentPosition + offset.y;

      // Calculate which snap point is closest
      const distances = snapPoints.map((_, index) => {
        return Math.abs(currentOffset - getYPosition(index));
      });

      let closestSnapPointIndex = distances.indexOf(Math.min(...distances));

      // If velocity is high enough, move in direction of drag
      if (Math.abs(velocity.y) > 500) {
        if (velocity.y > 0) {
          // Swiping down, go to next lower snap point
          closestSnapPointIndex = Math.min(snapPoints.length - 1, currentSnapPoint + 1);
        } else {
          // Swiping up, go to next higher snap point
          closestSnapPointIndex = Math.max(0, currentSnapPoint - 1);
        }
      }

      // If we're at the bottom snap point and dragging down further, close the sheet
      if (
        currentSnapPoint === snapPoints.length - 1 &&
        offset.y > 50 &&
        velocity.y > 0
      ) {
        onOpenChange?.(false);
        return;
      }

      setCurrentSnapPoint(closestSnapPointIndex);
    };

    return (
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              className={cn(
                "fixed inset-0 z-50 bg-black/60 backdrop-blur-sm",
                overlayClassName
              )}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => onOpenChange?.(false)}
            />
            <motion.div
              ref={sheetRef}
              className={cn(
                "fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl bg-background shadow-lg",
                className
              )}
              initial={{ y: "100%" }}
              animate={{ y: getYPosition(currentSnapPoint) }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
              drag="y"
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={0.1}
              onDragStart={(e: any) => {
                isDragging.current = true;
                startY.current = 'clientY' in e ? e.clientY : (e.touches ? e.touches[0].clientY : 0);
              }}
              onDrag={(e: any, info: any) => {
                if (contentRef.current) {
                  contentRef.current.style.overflow = 'hidden';
                }
              }}
              onDragEnd={(e: any, info: any) => {
                isDragging.current = false;
                if (contentRef.current) {
                  contentRef.current.style.overflow = 'auto';
                }
                handleDragEnd(e, info);
              }}
              {...props}
            >
              <div
                className={cn(
                  "sticky top-0 z-10 w-full flex justify-center p-2 bg-background",
                  handleClassName
                )}
              >
                <div className="w-10 h-1 bg-muted-foreground/30 rounded-full" />
              </div>
              <div 
                ref={contentRef}
                className="max-h-[calc(100vh-120px)] overflow-y-auto"
                onTouchStart={(e) => {
                  if (contentRef.current) {
                    const isAtTop = contentRef.current.scrollTop === 0;
                    if (isAtTop) {
                      startY.current = e.touches[0].clientY;
                    }
                  }
                }}
              >
                {children}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    );
  }
);

BottomSheet.displayName = "BottomSheet";

export { BottomSheet };
