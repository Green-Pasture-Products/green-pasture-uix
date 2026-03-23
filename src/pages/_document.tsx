import { Html, Head, Main, NextScript } from "next/document";

const themeScript = `
(function() {
  try {
    var theme = localStorage.getItem('gp-theme');
    if (!theme) {
      theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    }
  } catch(e) {}
})();
`;

export default function Document() {
	return (
		<Html lang="en">
			<Head>
				<link rel="preconnect" href="https://fonts.googleapis.com" />
				<link
					rel="preconnect"
					href="https://fonts.gstatic.com"
					crossOrigin="anonymous"
				/>
			</Head>
			<body className="antialiased font-sans">
				<script dangerouslySetInnerHTML={{ __html: themeScript }} />
				<Main />
				<NextScript />
			</body>
		</Html>
	);
}
