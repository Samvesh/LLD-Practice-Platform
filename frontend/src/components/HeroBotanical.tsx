export const LeftBotanical = () => {
  return (
    <div className="absolute left-0 bottom-0 pointer-events-none select-none z-0 overflow-hidden w-64 h-72 md:w-80 md:h-96 opacity-85">
      <svg
        viewBox="0 0 320 380"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full transform -translate-x-6 translate-y-6"
      >
        <defs>
          <linearGradient id="leafGrad1" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#C48866" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#8C5E47" stopOpacity="0.9" />
          </linearGradient>
          <linearGradient id="leafGrad2" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#D9A07E" stopOpacity="0.75" />
            <stop offset="100%" stopColor="#A86F54" stopOpacity="0.85" />
          </linearGradient>
          <linearGradient id="leafGrad3" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#BA7855" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#7E4D36" stopOpacity="0.85" />
          </linearGradient>
        </defs>

        {/* Stem 1 */}
        <path
          d="M-20 400C40 340 90 280 120 180"
          stroke="#8C5E47"
          strokeWidth="3.5"
          strokeLinecap="round"
          opacity="0.6"
        />
        {/* Leaf 1 - Large base */}
        <path
          d="M10 390C20 320 60 270 110 240C100 290 70 340 10 390Z"
          fill="url(#leafGrad1)"
        />
        {/* Leaf 2 - Mid left */}
        <path
          d="M-10 330C15 260 50 210 95 180C90 230 60 280 -10 330Z"
          fill="url(#leafGrad2)"
        />
        {/* Leaf 3 - Upright elongated */}
        <path
          d="M50 310C80 230 115 170 145 120C130 180 100 240 50 310Z"
          fill="url(#leafGrad3)"
        />
        {/* Leaf 4 - Graceful curve */}
        <path
          d="M75 270C110 190 140 140 170 80C155 140 125 200 75 270Z"
          fill="url(#leafGrad1)"
        />
        {/* Leaf 5 - Soft background leaf */}
        <path
          d="M-30 270C0 210 30 170 70 140C65 190 35 230 -30 270Z"
          fill="url(#leafGrad2)"
          opacity="0.6"
        />
        {/* Small tip leaf */}
        <path
          d="M110 210C135 150 160 110 190 60C175 110 150 160 110 210Z"
          fill="url(#leafGrad3)"
        />
      </svg>
    </div>
  );
};

export const RightBotanical = () => {
  return (
    <div className="absolute right-0 bottom-0 pointer-events-none select-none z-0 overflow-hidden w-64 h-72 md:w-80 md:h-96 opacity-85">
      <svg
        viewBox="0 0 320 380"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full transform translate-x-6 translate-y-6"
      >
        <defs>
          <linearGradient id="rightLeafGrad1" x1="100%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#C48866" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#8C5E47" stopOpacity="0.9" />
          </linearGradient>
          <linearGradient id="rightLeafGrad2" x1="100%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#D9A07E" stopOpacity="0.75" />
            <stop offset="100%" stopColor="#A86F54" stopOpacity="0.85" />
          </linearGradient>
          <linearGradient id="rightLeafGrad3" x1="100%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#BA7855" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#7E4D36" stopOpacity="0.85" />
          </linearGradient>
        </defs>

        {/* Stem */}
        <path
          d="M340 400C280 340 230 280 200 180"
          stroke="#8C5E47"
          strokeWidth="3.5"
          strokeLinecap="round"
          opacity="0.6"
        />
        {/* Leaf 1 */}
        <path
          d="M310 390C300 320 260 270 210 240C220 290 250 340 310 390Z"
          fill="url(#rightLeafGrad1)"
        />
        {/* Leaf 2 */}
        <path
          d="M330 330C305 260 270 210 225 180C230 230 260 280 330 330Z"
          fill="url(#rightLeafGrad2)"
        />
        {/* Leaf 3 */}
        <path
          d="M270 310C240 230 205 170 175 120C190 180 220 240 270 310Z"
          fill="url(#rightLeafGrad3)"
        />
        {/* Leaf 4 */}
        <path
          d="M245 270C210 190 180 140 150 80C165 140 195 200 245 270Z"
          fill="url(#rightLeafGrad1)"
        />
      </svg>
    </div>
  );
};
