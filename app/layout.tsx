import type { Metadata, Viewport } from 'next';
import './globals.css';
export const metadata: Metadata = {title:'Hit-Fit',description:'Seu treino, uma série de cada vez.',appleWebApp:{capable:true,statusBarStyle:'black-translucent',title:'Hit-Fit'}};
export const viewport:Viewport={width:'device-width',initialScale:1,viewportFit:'cover',themeColor:'#0b0d0b'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="pt-BR"><body>{children}</body></html>}
