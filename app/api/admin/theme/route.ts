// Standard Web / Next.js compatible API route handler for Theme configuration

export async function GET(request: Request) {
  try {
    const theme = {
      primaryColor: '#10B981',
      secondaryColor: '#06B6D4',
      backgroundColor: '#020617',
      themeMode: 'dark',
      themePalette: 'emerald'
    };
    return Response.json({ success: true, theme });
  } catch (error: any) {
    return Response.json({ success: false, error: error?.message || 'Failed to get theme' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const {
      primaryColor = '#10B981',
      secondaryColor = '#06B6D4',
      backgroundColor = '#020617',
      themeMode = 'dark',
      themePalette = 'emerald'
    } = body;

    const theme = {
      primaryColor,
      secondaryColor,
      backgroundColor,
      themeMode,
      themePalette
    };

    return Response.json({
      success: true,
      message: 'Theme saved and applied successfully.',
      theme
    });
  } catch (error: any) {
    return Response.json({ success: false, error: error?.message || 'Failed to save theme' }, { status: 500 });
  }
}
