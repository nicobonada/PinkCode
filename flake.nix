{
  description = "PinkCode: desktop GUI for Grok Build (ACP client)";

  inputs.nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";

  outputs =
    { nixpkgs, ... }:
    let
      systems = [
        "x86_64-linux"
        "aarch64-linux"
      ];
      forAllSystems = nixpkgs.lib.genAttrs systems;
    in
    {
      packages = forAllSystems (
        system:
        let
          pkgs = nixpkgs.legacyPackages.${system};
        in
        {
          default = pkgs.callPackage ./package.nix { };
        }
      );

      devShells = forAllSystems (
        system:
        let
          pkgs = nixpkgs.legacyPackages.${system};
        in
        {
          default = pkgs.mkShell {
            nativeBuildInputs = with pkgs; [
              pkg-config
              wrapGAppsHook3
              nodejs_24
              rustc
              cargo
              rustfmt
              clippy
              cargo-tauri
              git
            ];
            buildInputs = with pkgs; [
              glib
              glib-networking
              gtk3
              openssl
              pango
              cairo
              pixman
              librsvg
              gdk-pixbuf
              webkitgtk_4_1
            ];
            # WebKitGTK/Wayland: DMABUF is a common blank-or-flicker path.
            WEBKIT_DISABLE_DMABUF_RENDERER = "1";
            shellHook = ''
              export XDG_DATA_DIRS="''${GSETTINGS_SCHEMAS_PATH}''${XDG_DATA_DIRS:+:$XDG_DATA_DIRS}"
            '';
          };
        }
      );
    };
}
