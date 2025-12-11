"use client";

import React from "react";
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

type Slide = {
  id: number;
  content: React.ReactNode;
  label: string;
};

type ImageCarouselProps = {
  slides: Slide[];
  aspectRatio: string;
};

export default function ImageCarousel({ slides, aspectRatio }: ImageCarouselProps) {
  const [curr, setCurr] = useState(0);

  const prev = () => {
    setCurr((current) => (current === 0 ? slides.length - 1 : current - 1));
  };

  const next = () => {
    setCurr((current) => (current === slides.length - 1 ? 0 : current + 1));
  };

  return (
    <div className="w-full">
      <div
        className={`overflow-hidden relative rounded-xl bg-slate-800 border border-slate-700 shadow-2xl ${aspectRatio}`}
      >
        <div
          className="flex transition-transform ease-out duration-500"
          style={{ transform: `translateX(-${curr * 100}%)` }}
        >
          {slides.map((slide) => (
            <div key={slide.id} className="min-w-full">
              {slide.content}
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={prev}
          className="absolute left-3 top-1/2 -translate-y-1/2 bg-white text-slate-800 rounded-full p-2 shadow"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={next}
          className="absolute right-3 top-1/2 -translate-y-1/2 bg-white text-slate-800 rounded-full p-2 shadow"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      <div className="mt-4 flex justify-center gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setCurr(i)}
            className={`h-2 rounded-full transition-all ${
              curr === i ? "bg-blue-500 w-6" : "bg-slate-600 w-2"
            }`}
          />
        ))}
      </div>
      {slides[curr] && (
        <div className="text-sm text-slate-400 font-medium text-center mt-2">
          {slides[curr].label}
        </div>
      )}
    </div>
  );
}
