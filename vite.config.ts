import path from 'path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import Icons from 'unplugin-icons/vite'
import IconsResolver from 'unplugin-icons/resolver'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import compression from 'vite-plugin-compression';
import Inspect from 'vite-plugin-inspect'
// import bundleAnalyzer from 'rollup-plugin-bundle-analyzer'
/**
 * 自动生成组件名称
 * @description: xlSetupExtend
 * pages目录导出组件时按照目录结构生成组件名称，如：pages/control/site/create.vue => /control/site/create
 * 生成的组件名称可以在meta中配置componentName，如：/control/site/update
 * 当组件名称结尾是index时，会自动去掉index，如：/control/site/index => /control/site
 */
import xlSetupExtend from 'vite-plugin-vue-setup-path-extend'
const pathSrc = path.resolve(__dirname, './src')
// https://vitejs.dev/config/
export default defineConfig({
	resolve: {
		alias: {
			'@': pathSrc,
		},
	},
	build: {
		assetsDir:'assets',
		rollupOptions: {
			output: {
				manualChunks(id) {
					if (id.includes('node_modules')) {
						return 'vendor';
					}
				}
			}
		},
	},
	plugins: [
		// bundleAnalyzer({ port: 8888, }),
		compression({
			// 指定要压缩的文件类型，默认为 .js 和 .css
			// ext: '.js',
			// 开启Gzip压缩
			algorithm: 'gzip',
			// 超过(n)k才打包
			threshold: 50 * 1024,
			// 是否删除原始文件，默认为 false
			deleteOriginFile: false
		}),
		vue(),
		xlSetupExtend(),
		AutoImport({
			imports: ['vue'],
			resolvers: [
				ElementPlusResolver(),
				IconsResolver({
					prefix: 'Icon',
				}),
			],
			dts: path.resolve(__dirname, 'auto-imports.d.ts'),
			eslintrc: {
				enabled: true
			},
		}),
		Components({
			extensions: ['vue', 'md'],
			include: [/\.vue$/, /\.vue\?vue/, /\.md$/],
			resolvers: [
				IconsResolver({
					enabledCollections: ['ep'],
				}),
				ElementPlusResolver(),
			],
			dts: path.resolve(__dirname, 'components.d.ts'),
		}),
		Icons({
			autoInstall: true,
		}),
		Inspect()
	],
	// base: '/admin',
	// base: '/control',
	server: {
		open: true,
		port: 5173,
		// 接口代理（解决跨域）
		proxy: {
			"/local": {
				// target: "http://cloud.renloong.com/",
				target: "https://api.agent.xhadmin.cn/",
				changeOrigin: true,
				rewrite: (path) => path.replace(/^\/local/, ""),
			}
		},
	},
})
