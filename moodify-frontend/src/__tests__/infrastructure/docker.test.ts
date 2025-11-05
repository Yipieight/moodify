/**
 * @jest-environment node
 */
import { execSync } from 'child_process'
import * as fs from 'fs'
import * as path from 'path'

describe('Docker Infrastructure Tests', () => {
  const projectRoot = path.join(__dirname, '../../..')

  test('Dockerfile should exist', () => {
    const dockerfilePath = path.join(projectRoot, 'Dockerfile')
    expect(fs.existsSync(dockerfilePath)).toBe(true)
  })

  test('.dockerignore should exclude test files and node_modules', () => {
    const dockerignorePath = path.join(projectRoot, '.dockerignore')
    expect(fs.existsSync(dockerignorePath)).toBe(true)
    
    const content = fs.readFileSync(dockerignorePath, 'utf-8')
    expect(content).toMatch(/node_modules/)
    expect(content).toMatch(/test/)
    expect(content).toMatch(/\.next/)
  })

  test('Dockerfile should use multi-stage build', () => {
    const dockerfilePath = path.join(projectRoot, 'Dockerfile')
    const content = fs.readFileSync(dockerfilePath, 'utf-8')
    
    // Check for multi-stage build patterns
    expect(content).toMatch(/FROM.*AS.*base/)
    expect(content).toMatch(/FROM.*AS.*deps/)
    expect(content).toMatch(/FROM.*AS.*builder/)
    expect(content).toMatch(/FROM.*AS.*runner/)
  })

  test('Dockerfile should copy Prisma schema', () => {
    const dockerfilePath = path.join(projectRoot, 'Dockerfile')
    const content = fs.readFileSync(dockerfilePath, 'utf-8')
    
    expect(content).toMatch(/COPY.*prisma/)
  })

  test('Dockerfile should expose port 3000', () => {
    const dockerfilePath = path.join(projectRoot, 'Dockerfile')
    const content = fs.readFileSync(dockerfilePath, 'utf-8')
    
    expect(content).toMatch(/EXPOSE 3000/)
  })

  test('docker-compose.yml should exist and be valid YAML', () => {
    const dockerComposePath = path.join(projectRoot, 'docker-compose.yml')
    expect(fs.existsSync(dockerComposePath)).toBe(true)
    
    const content = fs.readFileSync(dockerComposePath, 'utf-8')
    expect(content).toMatch(/services:/)
    expect(content).toMatch(/moodify-frontend/)
  })

  test('docker-compose.yml should define required environment variables', () => {
    const dockerComposePath = path.join(projectRoot, 'docker-compose.yml')
    const content = fs.readFileSync(dockerComposePath, 'utf-8')
    
    expect(content).toMatch(/DATABASE_URL/)
    expect(content).toMatch(/NEXTAUTH_SECRET/)
    expect(content).toMatch(/NEXTAUTH_URL/)
  })

  test('package.json should have required build scripts', () => {
    const packageJsonPath = path.join(projectRoot, 'package.json')
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'))
    
    expect(packageJson.scripts).toHaveProperty('build')
    expect(packageJson.scripts).toHaveProperty('start')
    expect(packageJson.scripts).toHaveProperty('dev')
  })

  test('next.config should have standalone output for Docker', () => {
    const nextConfigPath = path.join(projectRoot, 'next.config.ts')
    const content = fs.readFileSync(nextConfigPath, 'utf-8')
    
    expect(content).toMatch(/output.*standalone/)
  })
})

