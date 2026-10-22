# 依赖公告核对 / Dependency advisory assessment
[中文](README.md) · [English](README.en.md)

范围为已有 glob 弃用警告及相邻依赖链，非完整 npm audit 或全供应链安全结论。本版锁文件仅更新两个 brace-expansion 条目。
Scope: the existing glob warning and adjacent dependency chain, not a complete npm audit or supply-chain certification. This revision changes only two brace-expansion lock entries.

| 公告 / Advisory | 锁定版本 / Locked versions | 判断 / Assessment |
|---|---|---|
| [GHSA-5j98-mcp5-4vw2](https://github.com/isaacs/node-glob/security/advisories/GHSA-5j98-mcp5-4vw2) | glob 10.5.0 | Listed patched version for CLI command injection; warning alone does not prove this CVE remains. / 此 CLI 注入已修复 |
| [GHSA-3ppc-4f35-3m26](https://github.com/isaacs/minimatch/security/advisories/GHSA-3ppc-4f35-3m26) | minimatch 9.0.9 / 10.2.5 | Above patched 9.0.6 / 10.2.1. / 不落入该项范围 |
| [GHSA-7r86-cg39-jmmj](https://github.com/isaacs/minimatch/security/advisories/GHSA-7r86-cg39-jmmj) and [GHSA-23c5-xmqv-rm74](https://github.com/isaacs/minimatch/security/advisories/GHSA-23c5-xmqv-rm74) | minimatch 9.0.9 / 10.2.5 | Above patched 9.0.7 / 10.2.3. / 不落入这两项范围 |
| [GHSA-q2hr-2g5m-vwhr](https://github.com/advisories/GHSA-q2hr-2g5m-vwhr) | brace-expansion 5.0.12 / 2.1.7 | At patched 5.0.12 / 2.1.7. / 本版已修复 |
| [GHSA-qhr7-859c-m2p7](https://github.com/advisories/GHSA-qhr7-859c-m2p7) | brace-expansion 5.0.12 / 2.1.7 | Above patched 5.0.11 / 2.1.6. / 本版不在影响范围 |
| [GHSA-6j4f-fj2g-mc7p](https://github.com/advisories/GHSA-6j4f-fj2g-mc7p) | brace-expansion 5.0.12 / 2.1.7 | Above patched 5.0.10 / 2.1.5. / 本版不在影响范围 |

Observed path: @vitest/coverage-v8 3.2.6 → test-exclude 7.0.2 → glob 10.5.0 → minimatch 9.0.9 → brace-expansion 2.1.7; test-exclude also uses minimatch 10.2.5 → brace-expansion 5.0.12.
该链属于覆盖率工具。源码 src 未发现 glob/minimatch/brace-expansion 导入或用户 glob 输入入口。生产浏览器可利用性未证明；不能把版本命中等同于已发生攻击，也不能据此宣称整个依赖树安全。

The source has no observed application import or user glob input for this chain. Browser exploitability is unproven. The three identified brace-expansion advisories are addressed at the locked versions. Untrusted tool configuration remains outside the supported use. This is a targeted assessment, not a full online audit.


## Revision 4 实际修复 / Actual remediation
Official metadata verified both requested versions and integrity values. npm update brace-expansion --package-lock-only through the official registry changed exactly two package entries: 2.1.1 → 2.1.7 and 5.0.6 → 5.0.12. Existing ^2.0.2 / ^5.0.5 ranges are satisfied. package.json and every other locked package are unchanged. The 5.0.12 engine declaration is now Node 20 or >=22; the app already declares >=20 and is verified on Node 24 only.

Normal npm ci (scripts enabled, fresh cache, official registry) installed 235 packages, exit 0. npm ls confirms only brace-expansion 2.1.7 / 5.0.12 on this chain. Content generation, 95 tests, engine coverage and production build all pass with those installed dependencies.

默认沙箱此前返回 ENOTFOUND；工具的正常审批网络路径成功访问官方 registry。未修改 DNS、VPN、代理或安全设置，也未手写 tarball integrity。glob 10.5.0 的弃用警告仍存在，其已核对 CLI 公告处于已修复版本；未据此泛化升级其他工具或宣称不存在其他公告。独立复核仍待完成，未公开。
