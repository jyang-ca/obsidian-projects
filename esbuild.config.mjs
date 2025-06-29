import esbuild from "esbuild";
import process from "process";
import builtins from "builtin-modules";
import esbuildSvelte from "esbuild-svelte";
import sveltePreprocess from "svelte-preprocess";
import { replace } from "esbuild-plugin-replace";
import fs from "node:fs"; // Node.js 파일 시스템 모듈
import path from "node:path"; // Node.js 경로 모듈

const banner = `/*
THIS IS A GENERATED/BUNDLED FILE BY ESBUILD
if you want to view the source, please visit the github repository of this plugin
*/
`;

const prod = process.argv[2] === "production";
const buildDir = "build"; // 빌드 폴더명

esbuild
  .build({
    plugins: [
      esbuildSvelte({
        compilerOptions: { css: true }, // Svelte 컴포넌트 내의 CSS를 처리
        preprocess: sveltePreprocess(),
      }),
      replace({
        include: /svelte-dnd-action.*$/,
        delimiters: ["", ""],
        values: {
          "window.": `activeWindow.`,
          "document.": `activeDocument.`,
        },
      }),
    ],
    banner: {
      js: banner,
    },
    entryPoints: ["./src/main.ts"],
    bundle: true,
    external: [
      "obsidian",
      "electron",
      "@codemirror/autocomplete",
      "@codemirror/closebrackets",
      "@codemirror/collab",
      "@codemirror/commands",
      "@codemirror/comment",
      "@codemirror/fold",
      "@codemirror/gutter",
      "@codemirror/highlight",
      "@codemirror/history",
      "@codemirror/language",
      "@codemirror/lint",
      "@codemirror/matchbrackets",
      "@codemirror/panel",
      "@codemirror/rangeset",
      "@codemirror/rectangular-selection",
      "@codemirror/search",
      "@codemirror/state",
      "@codemirror/stream-parser",
      "@codemirror/text",
      "@codemirror/tooltip",
      "@codemirror/view",
      ...builtins,
    ],
    format: "cjs",
    watch: !prod
      ? {
        onRebuild(error, result) {
          if (error) console.error("Watch build failed:", error);
          else {
            console.log("Watch build succeeded:", result);
            copyFilesToBuildDir(); // 리빌드 후에도 파일 복사
          }
        },
      }
      : false,
    target: "es2016",
    logLevel: "info",
    sourcemap: prod ? false : "inline",
    treeShaking: true,
    minify: prod,
    outfile: path.join(buildDir, "main.js"), // main.js를 build 폴더에 생성
  })
  .then(() => {
    console.log("Initial build successful!");
    copyFilesToBuildDir(); // 초기 빌드 후 파일 복사
    if (!prod) {
      console.log("Watching for changes...");
    }
  })
  .catch((e) => {
    console.error("Build failed:", e);
    process.exit(1);
  });

// 파일을 build 폴더로 복사하는 함수
function copyFilesToBuildDir() {
  // build 폴더가 없으면 생성
  if (!fs.existsSync(buildDir)) {
    fs.mkdirSync(buildDir, { recursive: true });
    console.log(`Created directory: ${buildDir}`);
  }

  const filesToCopy = ["manifest.json", "styles.css"];

  filesToCopy.forEach((fileName) => {
    const sourcePath = path.resolve(fileName); // 루트 디렉토리의 파일
    const destinationPath = path.resolve(buildDir, fileName); // build 폴더 내의 파일

    if (fs.existsSync(sourcePath)) {
      try {
        fs.copyFileSync(sourcePath, destinationPath);
        console.log(`Copied ${fileName} to ${buildDir}/${fileName}`);
      } catch (err) {
        console.error(`Error copying ${fileName}:`, err);
      }
    } else {
      // styles.css는 선택 사항일 수 있으므로 경고만 표시
      if (fileName === "styles.css") {
        console.warn(
          `Warning: ${fileName} not found in the root directory. Not copied.`
        );
      } else {
        console.error(
          `Error: ${fileName} not found in the root directory. Please ensure it exists.`
        );
      }
    }
  });
}