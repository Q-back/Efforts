# Setting Up GitHub Pages for Efforts

Before the GitHub Actions workflow can successfully deploy your site, you need to manually enable GitHub Pages in your repository settings. Follow these steps:

## Enable GitHub Pages in Repository Settings

1. Go to your GitHub repository: https://github.com/Q-back/Efforts
2. Click on "Settings" tab
3. Scroll down to the "Pages" section in the left sidebar
4. Under "Build and deployment":
   - Source: Select "GitHub Actions"
5. Click "Save"

## After Enabling GitHub Pages

Once GitHub Pages is enabled, commit and push a change to trigger the workflow again, or manually trigger it from the Actions tab.

## Troubleshooting

If deployments still fail:
1. Check that the repository has the correct permissions (Settings > Actions > General)
2. Verify that the GitHub token has the necessary permissions
3. Try manually running the workflow from the Actions tab

## Accessing Your Site

After successful deployment, your site will be available at:
https://q-back.github.io/Efforts/
