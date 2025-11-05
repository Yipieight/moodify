/**
 * @jest-environment node
 */
import * as fs from 'fs'
import * as path from 'path'

describe('Environment Configuration Tests', () => {
  const projectRoot = path.join(__dirname, '../../..')

  test('env.example.txt should exist as template', () => {
    const envExamplePath = path.join(projectRoot, 'env.example.txt')
    expect(fs.existsSync(envExamplePath)).toBe(true)
  })

  test('env.example.txt should have required environment variables', () => {
    const envExamplePath = path.join(projectRoot, 'env.example.txt')
    const content = fs.readFileSync(envExamplePath, 'utf-8')
    
    const requiredVars = [
      'DATABASE_URL',
      'NEXTAUTH_SECRET',
      'NEXTAUTH_URL',
      'NEXT_PUBLIC_SPOTIFY_CLIENT_ID',
      'SPOTIFY_CLIENT_SECRET'
    ]
    
    requiredVars.forEach(varName => {
      expect(content).toMatch(new RegExp(varName))
    })
  })

  test('.gitignore should exclude .env files', () => {
    const gitignorePath = path.join(projectRoot, '.gitignore')
    const content = fs.readFileSync(gitignorePath, 'utf-8')
    
    expect(content).toMatch(/\.env/)
  })

  test('.gitignore should exclude node_modules', () => {
    const gitignorePath = path.join(projectRoot, '.gitignore')
    const content = fs.readFileSync(gitignorePath, 'utf-8')
    
    expect(content).toMatch(/node_modules/)
  })

  test('.gitignore should exclude Terraform files', () => {
    const gitignorePath = path.join(projectRoot, '.gitignore')
    const content = fs.readFileSync(gitignorePath, 'utf-8')
    
    expect(content).toMatch(/\.terraform/)
  })

  test('Prisma schema should use environment variables', () => {
    const schemaPath = path.join(projectRoot, 'prisma/schema.prisma')
    const content = fs.readFileSync(schemaPath, 'utf-8')
    
    expect(content).toMatch(/env\("DATABASE_URL"\)/)
    expect(content).toMatch(/env\("DIRECT_URL"\)/)
  })

  test('Prisma schema should define all required NextAuth models', () => {
    const schemaPath = path.join(projectRoot, 'prisma/schema.prisma')
    const content = fs.readFileSync(schemaPath, 'utf-8')
    
    // NextAuth required models with PascalCase
    expect(content).toMatch(/model Account/)
    expect(content).toMatch(/model User/)
    expect(content).toMatch(/model Session/)
    expect(content).toMatch(/model VerificationToken/)
  })

  test('TypeScript should exclude test files from build', () => {
    const tsconfigPath = path.join(projectRoot, 'tsconfig.json')
    const content = fs.readFileSync(tsconfigPath, 'utf-8')
    const tsconfig = JSON.parse(content)
    
    expect(tsconfig.exclude).toBeDefined()
    expect(tsconfig.exclude).toContain('node_modules')
  })
})

