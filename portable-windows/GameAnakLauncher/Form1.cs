using System;
using System.Drawing;
using System.IO;
using System.Threading.Tasks;
using System.Windows.Forms;
using Microsoft.Web.WebView2.Core;
using Microsoft.Web.WebView2.WinForms;

namespace GameAnakLauncher;

public partial class Form1 : Form
{
    private WebView2 webView;
    private bool isFullScreen = false;
    private FormWindowState previousWindowState;
    private FormBorderStyle previousBorderStyle;
    private Rectangle previousBounds;

    public Form1()
    {
        InitializeComponent();
        SetupForm();
        InitializeWebView();
    }

    private void SetupForm()
    {
        this.Text = "Petualangan Spidey Cilik — Game Edukasi Balita";
        this.Size = new Size(1080, 768);
        this.MinimumSize = new Size(720, 520);
        this.StartPosition = FormStartPosition.CenterScreen;
        this.BackColor = Color.FromArgb(239, 68, 68); // Spidey crimson red
        this.KeyPreview = true;
        this.KeyDown += Form1_KeyDown;

        webView = new WebView2
        {
            Dock = DockStyle.Fill
        };
        this.Controls.Add(webView);
    }

    private async void InitializeWebView()
    {
        try
        {
            string appDir = AppDomain.CurrentDomain.BaseDirectory;
            string assetsDir = Path.Combine(appDir, "www");
            if (!Directory.Exists(assetsDir) || !File.Exists(Path.Combine(assetsDir, "index.html")))
            {
                // Fallback to parent directory in dev workspace
                string devDir = Path.GetFullPath(Path.Combine(appDir, "..", "..", "..", ".."));
                if (File.Exists(Path.Combine(devDir, "index.html")))
                {
                    assetsDir = devDir;
                }
            }

            string userDataFolder = Path.Combine(
                Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData),
                "GameAnak",
                "WebView2Data"
            );
            Directory.CreateDirectory(userDataFolder);

            var env = await CoreWebView2Environment.CreateAsync(null, userDataFolder);
            await webView.EnsureCoreWebView2Async(env);

            // Configure toddler-safe WebView2 settings
            webView.CoreWebView2.Settings.AreDevToolsEnabled = false;
            webView.CoreWebView2.Settings.IsStatusBarEnabled = false;
            webView.CoreWebView2.Settings.AreDefaultContextMenusEnabled = false;
            webView.CoreWebView2.Settings.IsZoomControlEnabled = false;

            // Map local directory to HTTPS origin (enables ES Modules, Web Audio & PWA APIs without CORS issues)
            webView.CoreWebView2.SetVirtualHostNameToFolderMapping(
                "gameanak.local",
                assetsDir,
                CoreWebView2HostResourceAccessKind.Allow
            );

            webView.CoreWebView2.Navigate("https://gameanak.local/index.html");
        }
        catch (Exception ex)
        {
            MessageBox.Show(
                $"Gagal memuat game: {ex.Message}\n\nPastikan Microsoft Edge WebView2 Runtime terpasang di Windows.",
                "Petualangan Spidey Cilik",
                MessageBoxButtons.OK,
                MessageBoxIcon.Error
            );
        }
    }

    private void Form1_KeyDown(object? sender, KeyEventArgs e)
    {
        // F11: Toggle Fullscreen Kiosk Mode for children
        if (e.KeyCode == Keys.F11)
        {
            ToggleFullScreen();
            e.Handled = true;
        }
        // Escape: Exit Fullscreen
        else if (e.KeyCode == Keys.Escape && isFullScreen)
        {
            ToggleFullScreen();
            e.Handled = true;
        }
    }

    private void ToggleFullScreen()
    {
        if (!isFullScreen)
        {
            previousWindowState = this.WindowState;
            previousBorderStyle = this.FormBorderStyle;
            previousBounds = this.Bounds;

            this.FormBorderStyle = FormBorderStyle.None;
            this.WindowState = FormWindowState.Normal;
            this.Bounds = Screen.FromControl(this).Bounds;
            isFullScreen = true;
        }
        else
        {
            this.FormBorderStyle = previousBorderStyle;
            this.WindowState = previousWindowState;
            this.Bounds = previousBounds;
            isFullScreen = false;
        }
    }
}
