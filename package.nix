# Unofficial Grok Build desktop GUI (ACP client). Not xAI.
# Nix is the distribution path: skip the GitHub updater.
{
  lib,
  rustPlatform,
  cargo-tauri,
  npmHooks,
  fetchNpmDeps,
  pkg-config,
  nodejs,
  webkitgtk_4_1,
  glib,
  glib-networking,
  gtk3,
  openssl,
  pango,
  cairo,
  pixman,
  librsvg,
  gdk-pixbuf,
  adwaita-icon-theme,
  stdenv,
  wrapGAppsHook3,
  git,
}:

rustPlatform.buildRustPackage (finalAttrs: {
  pname = "pinkcode";
  version = "1.2.1";

  src = lib.cleanSourceWith {
    src = ./.;
    filter =
      path: type:
      let
        base = baseNameOf path;
      in
      lib.cleanSourceFilter path type && base != "node_modules" && base != "target" && base != ".jj";
  };

  npmDeps = fetchNpmDeps {
    inherit (finalAttrs) src;
    hash = "sha256-lbP4E6PqQhlAl2SHOHU9O5eSt49WQfw7ajTX4N9QG1E=";
    fetcherVersion = 2;
  };

  cargoHash = "sha256-5xWwk2rE3fEOwGnQ9wS2KOWZl3GLiLhqXT5FatV4pEA=";

  cargoRoot = "src-tauri";
  buildAndTestSubdir = "src-tauri";

  nativeBuildInputs = [
    cargo-tauri.hook
    npmHooks.npmConfigHook
    pkg-config
    nodejs
    wrapGAppsHook3
  ];

  buildInputs = [
    glib
    glib-networking
    gtk3
    openssl
    pango
    cairo
    pixman
    librsvg
    gdk-pixbuf
    adwaita-icon-theme
  ]
  ++ lib.optionals stdenv.hostPlatform.isLinux [
    webkitgtk_4_1
  ];

  # Hook cwd is src-tauri; frontend lives at the repo root (npmConfigHook).
  # Opaque, no CSD: acrylic + Overlay titlebar is macOS/Windows-shaped and
  # looks wrong on niri (WebKitGTK + Wayland). niri draws the window border.
  postPatch = ''
    node -e ${lib.escapeShellArg ''
      const fs = require("fs");
      const path = "src-tauri/tauri.conf.json";
      const cfg = JSON.parse(fs.readFileSync(path, "utf8"));
      cfg.build.beforeBuildCommand = "";
      cfg.bundle.createUpdaterArtifacts = false;
      for (const win of cfg.app.windows ?? []) {
        win.transparent = false;
        delete win.windowEffects;
        win.decorations = false;
        win.titleBarStyle = "Visible";
        win.hiddenTitle = false;
        win.backgroundColor = [250, 244, 237, 255];
      }
      fs.writeFileSync(path, JSON.stringify(cfg, null, 2) + "\n");
    ''}
  '';

  preBuild = ''
    npm run build
  '';

  # Workspace git UI shells out to `git`.
  # DMABUF renderer is a common WebKitGTK/Wayland blank-or-flicker path.
  preFixup = ''
    gappsWrapperArgs+=(
      --prefix PATH : ${lib.makeBinPath [ git ]}
      --set-default WEBKIT_DISABLE_DMABUF_RENDERER 1
      --set-default GTK_CSD 0
    )
  '';

  doCheck = false;

  postInstall = ''
    ln -s "$out/bin/PinkCode" "$out/bin/pinkcode"
  '';

  meta = {
    description = "Desktop GUI for Grok Build: multi-session task board over ACP";
    homepage = "https://github.com/3xian/PinkCode";
    changelog = "https://github.com/3xian/PinkCode/releases/tag/v${finalAttrs.version}";
    license = lib.licenses.asl20;
    mainProgram = "pinkcode";
    platforms = [
      "x86_64-linux"
      "aarch64-linux"
    ];
  };
})
