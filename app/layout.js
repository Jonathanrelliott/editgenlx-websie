import React from 'react';
import './globals.css';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Toast from '../components/Toast';
import { GalleryProvider } from '../context/GalleryContext';

export const metadata = {
  title: 'EditGenlx - Sports & Event Photography',
  description: 'SIDELINE HIGH ENERGY CAPTURE FRAME ENGINE',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col justify-between bg-[#f6f1e8]">
        <GalleryProvider>
          <Header />
          <Toast />
          <main className="flex-grow">{children}</main>
          <Footer />
        </GalleryProvider>
      </body>
    </html>
  );
}