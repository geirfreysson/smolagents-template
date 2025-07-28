import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";

interface StreamingFinalAnswerProps {
  content: string;
  isComplete: boolean;
}

export const StreamingFinalAnswer = ({ content, isComplete }: StreamingFinalAnswerProps) => {
  const [displayedContent, setDisplayedContent] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (isComplete) {
      // When complete, show all content immediately
      setDisplayedContent(content);
      return;
    }

    // Stream content token by token
    if (currentIndex < content.length) {
      const timer = setTimeout(() => {
        // Find next word boundary or character
        let nextIndex = currentIndex + 1;
        
        // If we're at a space, include the next word
        if (content[currentIndex] === ' ') {
          const nextSpaceIndex = content.indexOf(' ', currentIndex + 1);
          nextIndex = nextSpaceIndex === -1 ? content.length : nextSpaceIndex + 1;
        }
        
        setDisplayedContent(content.slice(0, nextIndex));
        setCurrentIndex(nextIndex);
      }, 50); // Adjust speed as needed

      return () => clearTimeout(timer);
    }
  }, [content, currentIndex, isComplete]);

  // Reset when content changes
  useEffect(() => {
    setCurrentIndex(0);
    setDisplayedContent("");
  }, [content]);

  return (
    <div className="prose max-w-none">
      <div className="text-base leading-7">
        <div className="aui-md">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              h1: ({ className, ...props }) => (
                <h1 className={cn("mb-8 scroll-m-20 text-4xl font-extrabold tracking-tight last:mb-0", className)} {...props} />
              ),
              h2: ({ className, ...props }) => (
                <h2 className={cn("mb-4 mt-8 scroll-m-20 text-3xl font-semibold tracking-tight first:mt-0 last:mb-0", className)} {...props} />
              ),
              h3: ({ className, ...props }) => (
                <h3 className={cn("mb-4 mt-6 scroll-m-20 text-2xl font-semibold tracking-tight first:mt-0 last:mb-0", className)} {...props} />
              ),
              h4: ({ className, ...props }) => (
                <h4 className={cn("mb-4 mt-6 scroll-m-20 text-xl font-semibold tracking-tight first:mt-0 last:mb-0", className)} {...props} />
              ),
              h5: ({ className, ...props }) => (
                <h5 className={cn("my-4 text-lg font-semibold first:mt-0 last:mb-0", className)} {...props} />
              ),
              h6: ({ className, ...props }) => (
                <h6 className={cn("my-4 font-semibold first:mt-0 last:mb-0", className)} {...props} />
              ),
              p: ({ className, ...props }) => (
                <p className={cn("mb-5 mt-5 leading-7 first:mt-0 last:mb-0", className)} {...props} />
              ),
              a: ({ className, ...props }) => (
                <a className={cn("text-primary font-medium underline underline-offset-4", className)} {...props} />
              ),
              blockquote: ({ className, ...props }) => (
                <blockquote className={cn("border-l-2 pl-6 italic", className)} {...props} />
              ),
              ul: ({ className, ...props }) => (
                <ul className={cn("my-5 ml-6 list-disc [&>li]:mt-2", className)} {...props} />
              ),
              ol: ({ className, ...props }) => (
                <ol className={cn("my-5 ml-6 list-decimal [&>li]:mt-2", className)} {...props} />
              ),
              hr: ({ className, ...props }) => (
                <hr className={cn("my-5 border-b", className)} {...props} />
              ),
              table: ({ className, ...props }) => (
                <table className={cn("my-5 w-full border-separate border-spacing-0 overflow-y-auto", className)} {...props} />
              ),
              th: ({ className, ...props }) => (
                <th className={cn("bg-muted px-4 py-2 text-left font-bold first:rounded-tl-lg last:rounded-tr-lg [&[align=center]]:text-center [&[align=right]]:text-right", className)} {...props} />
              ),
              td: ({ className, ...props }) => (
                <td className={cn("border-b border-l px-4 py-2 text-left last:border-r [&[align=center]]:text-center [&[align=right]]:text-right", className)} {...props} />
              ),
              tr: ({ className, ...props }) => (
                <tr className={cn("m-0 border-b p-0 first:border-t [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg", className)} {...props} />
              ),
              sup: ({ className, ...props }) => (
                <sup className={cn("[&>a]:text-xs [&>a]:no-underline", className)} {...props} />
              ),
              pre: ({ className, ...props }) => (
                <pre className={cn("overflow-x-auto rounded-b-lg bg-black p-4 text-white", className)} {...props} />
              ),
              code: ({ className, ...props }) => (
                <code className={cn("bg-muted rounded border font-semibold", className)} {...props} />
              ),
            }}
          >
            {displayedContent}
          </ReactMarkdown>
          {!isComplete && displayedContent.length < content.length && (
            <span className="animate-pulse">|</span>
          )}
        </div>
      </div>
    </div>
  );
};