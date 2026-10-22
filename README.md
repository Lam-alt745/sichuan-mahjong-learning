# 川麻 · Sichuan Mahjong
[English](README.en.md)

离线双语四川麻将学习应用：43 课、61 术语、6 类练习、12 题摸底、本地血战到底教学牌桌。中文、英文与双语阅读模式，积分只用于教学。

## 运行
验证环境 Node.js 24；历史 engines 为 >=20，其他版本未验证。
```sh
npm ci --registry=https://registry.npmjs.org
npm run content
npm test
npm run test:coverage
npm run build
npm run dev -- --host 127.0.0.1
```
打开终端显示的本地地址；dist 可由静态服务器提供。开发服务有热更新通信。生产应用未发现外部请求代码；无 Service Worker，首次加载后断网刷新未验。

## 架构和隐私
src/engine：规则、牌桌、教练、概率、计分；src/placement：学习摸底；src/pages 和 components：界面；src/state/progress.ts：进度。content 六级课程由 scripts/build-content.ts 生成至 src/content。test 覆盖引擎、摸底和进度解析。

无账号、服务端、遥测或外部 AI。学习记录保存在 localStorage 的 sichuan-mahjong.v1 键。导入/导出由用户主动触发；导出文件含学习记录，应自行保管。清除站点存储可重置。演示和测试使用程序生成数据，候选未包含真实学习记录。

## 规则与许可
计分以 content/rules-facts.md §K 为教学默认，不代表所有平台；查大叫取最大基础番型，天胡/地胡使用首摸和第一圈近似。无真钱、下注或在线对战。英文仅用于阅读对照。

维护身份：[Lam-alt745](https://github.com/Lam-alt745)。这是待独立审查候选，尚未获准发布。所有者确认自有代码和内容由其与 AI 生成，并授权采用 [MIT](LICENSE)；第三方依赖及维基参考/改编部分保留原许可，适用范围见 [许可范围](LICENSE-SCOPE.md) 和 [来源清单](PROVENANCE.md)。实际文字比对未识别出长篇复用，百科参考及核查局限见 [来源检查](SOURCE-REVIEW.md)。测试通过不等于发布权或人工验收通过。

进度导入只接受允许的持久化字段，拒绝未知/危险键及非法结构；旧版 v1 文件的缺省字段仍兼容。解析上限为 100 万字符，嵌套深度受限。依赖公告核对见 [依赖评估](DEPENDENCY-ADVISORIES.md)。
