"use client";

import { createGlobalStyle } from "styled-components";

export const GlobalStyles = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;600;700&family=Poppins:wght@300;400;500;600;700&display=swap');

  *, *::before, *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  html {
    scroll-behavior: smooth;
  }

  body {
    font-family: 'Noto Sans KR', 'Poppins', sans-serif;
    font-size: 16px;
    line-height: 1.6;
    color: #1e1e1e;
    background-color: #ffffff;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  a {
    text-decoration: none;
    color: inherit;
    transition: color 0.3s ease;
  }

  img {
    max-width: 100%;
    height: auto;
    display: block;
  }

  ul, ol {
    list-style: none;
  }

  button {
    cursor: pointer;
    border: none;
    background: none;
    font-family: inherit;
  }

  input, textarea, select {
    font-family: inherit;
    font-size: inherit;
  }

  h1, h2, h3, h4, h5, h6 {
    font-weight: 600;
    line-height: 1.3;
  }

  /* Swiper custom styles */
  .swiper-pagination-bullet {
    background-color: #ffffff;
    opacity: 0.5;
  }

  .swiper-pagination-bullet-active {
    background-color: #f35525;
    opacity: 1;
  }

  .swiper-button-next,
  .swiper-button-prev {
    color: #ffffff;
  }

  /* Scrollbar styles */
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  ::-webkit-scrollbar-track {
    background: #f1f1f1;
  }

  ::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 4px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: #a1a1a1;
  }

  /* Selection styles */
  ::selection {
    background-color: #f35525;
    color: #ffffff;
  }
`;
