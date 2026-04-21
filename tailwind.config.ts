import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#0c0c0e',
        surface: '#111113',
        surfaceHi: '#15151a',
        border: '#1f1f23',
        text: '#ededed',
        muted: '#6b7280',
        // 单强调色：琥珀金（替代原紫橙双色渐变）
        amber: '#d4a574',
        amberHi: '#e6bb89',
        // 语义别名保持向后兼容，全部收敛为琥珀金
        accent: '#d4a574',
        accentHi: '#e6bb89',
        echo: '#d4a574',
        echoHi: '#e6bb89',
        warn: '#f5c400',
        danger: '#ff3860',
        ok: '#22c55e',
        qingyu: '#caa45d',
        santi: '#7a8fa8',
        fanhua: '#c07a7a',
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', '"PingFang SC"', '"Hiragino Sans GB"', '"Microsoft YaHei"', 'sans-serif'],
        serif: ['"Noto Serif SC"', '"Songti SC"', 'serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Consolas', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'scan-line': 'scanLine 2s linear infinite',
        'glitch': 'glitch 0.3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scanLine: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        glitch: {
          '0%, 100%': { transform: 'translate(0)' },
          '20%': { transform: 'translate(-2px, 2px)' },
          '40%': { transform: 'translate(-2px, -2px)' },
          '60%': { transform: 'translate(2px, 2px)' },
          '80%': { transform: 'translate(2px, -2px)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
