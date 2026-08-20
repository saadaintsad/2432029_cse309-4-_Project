"use client";

import { Font } from "@react-pdf/renderer";

// Noto Sans Bengali covers both Latin and the Bengali Taka sign (৳ / U+09F3)
// used throughout the PDF format (spec section 8). The built-in PDF base-14
// fonts (Helvetica etc.) don't include Bengali glyphs at all.
Font.register({
  family: "Noto Sans Bengali",
  fonts: [
    {
      src: "https://fonts.gstatic.com/s/notosansbengali/v33/Cn-SJsCGWQxOjaGwMQ6fIiMywrNJIky6nvd8BjzVMvJx2mcSPVFpVEqE-6KmsolLudA.ttf",
      fontWeight: 400,
    },
    {
      src: "https://fonts.gstatic.com/s/notosansbengali/v33/Cn-SJsCGWQxOjaGwMQ6fIiMywrNJIky6nvd8BjzVMvJx2mcSPVFpVEqE-6Kmsm5MudA.ttf",
      fontWeight: 700,
    },
  ],
});

export const PDF_FONT_FAMILY = "Noto Sans Bengali";
