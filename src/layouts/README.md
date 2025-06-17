# 文件夹规范

#### 该文件见存放的是视图布局文件模板

遵循“模板名称/模板文件”路径格式

创建新的视图模板之后需要在index.ts导出，导出名称遵循驼峰法命名

在后端menu.json文件中“component”字段使用

如“home”模板视图，导出命名为：
```typescript
import homeComponent from './home/index.vue';
const components = {
    homeComponent
}
export type componentsType = keyof typeof components;
export default components;
```
后端menu.json中使用
```json
{
    "component":"home"
}
```