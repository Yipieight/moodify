import { test, expect } from '@playwright/test'

test.describe('Authentication Flow', () => {
  test('should show login page', async ({ page }) => {
    await page.goto('/auth/login')
    
    await expect(page).toHaveTitle(/Moodify/)
    await expect(page.getByRole('heading', { name: /login/i })).toBeVisible()
  })

  test('should navigate to registration page', async ({ page }) => {
    await page.goto('/auth/login')
    
    await page.click('text=Sign up')
    await expect(page).toHaveURL(/\/auth\/register/)
    await expect(page.getByRole('heading', { name: /register/i })).toBeVisible()
  })

  test('should show error for invalid login', async ({ page }) => {
    await page.goto('/auth/login')
    
    await page.fill('input[type="email"]', 'invalid@example.com')
    await page.fill('input[type="password"]', 'wrongpassword')
    await page.click('button[type="submit"]')
    
    // Wait for error message
    await expect(page.getByText(/invalid credentials/i)).toBeVisible({ timeout: 5000 })
  })

  test('should register new user successfully', async ({ page }) => {
    const timestamp = Date.now()
    const email = `test-${timestamp}@example.com`
    
    await page.goto('/auth/register')
    
    await page.fill('input[name="name"]', 'Test User')
    await page.fill('input[type="email"]', email)
    await page.fill('input[type="password"]', 'TestPassword123!')
    await page.click('button[type="submit"]')
    
    // Should redirect to login or dashboard
    await expect(page).toHaveURL(/\/(auth\/login|dashboard)/, { timeout: 10000 })
  })

  test('should show Spotify OAuth button', async ({ page }) => {
    await page.goto('/auth/login')
    
    const spotifyButton = page.getByRole('button', { name: /continue with spotify/i })
    await expect(spotifyButton).toBeVisible()
  })

  test('should prevent access to protected routes when not authenticated', async ({ page }) => {
    await page.goto('/dashboard')
    
    // Should redirect to login
    await expect(page).toHaveURL(/\/auth\/login/, { timeout: 5000 })
  })
})

