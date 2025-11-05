/**
 * @jest-environment node
 */
import * as fs from 'fs'
import * as path from 'path'

describe('Terraform Infrastructure Tests', () => {
  const infraRoot = path.join(__dirname, '../../../infrastructure/terraform')

  test('Terraform main.tf should exist', () => {
    const mainTfPath = path.join(infraRoot, 'main.tf')
    expect(fs.existsSync(mainTfPath)).toBe(true)
  })

  test('Terraform variables.tf should exist', () => {
    const variablesTfPath = path.join(infraRoot, 'variables.tf')
    expect(fs.existsSync(variablesTfPath)).toBe(true)
  })

  test('Terraform outputs.tf should exist', () => {
    const outputsTfPath = path.join(infraRoot, 'outputs.tf')
    expect(fs.existsSync(outputsTfPath)).toBe(true)
  })

  test('Required Terraform modules should exist', () => {
    const requiredModules = ['ecs', 'vpc', 'alb', 'security']
    
    requiredModules.forEach(moduleName => {
      const modulePath = path.join(infraRoot, 'modules', moduleName)
      expect(fs.existsSync(modulePath)).toBe(true)
    })
  })

  test('ECS module should have required files', () => {
    const ecsModulePath = path.join(infraRoot, 'modules/ecs')
    
    expect(fs.existsSync(path.join(ecsModulePath, 'main.tf'))).toBe(true)
    expect(fs.existsSync(path.join(ecsModulePath, 'variables.tf'))).toBe(true)
    expect(fs.existsSync(path.join(ecsModulePath, 'outputs.tf'))).toBe(true)
    expect(fs.existsSync(path.join(ecsModulePath, 'iam.tf'))).toBe(true)
  })

  test('VPC module should have required files', () => {
    const vpcModulePath = path.join(infraRoot, 'modules/vpc')
    
    expect(fs.existsSync(path.join(vpcModulePath, 'main.tf'))).toBe(true)
    expect(fs.existsSync(path.join(vpcModulePath, 'variables.tf'))).toBe(true)
    expect(fs.existsSync(path.join(vpcModulePath, 'outputs.tf'))).toBe(true)
  })

  test('terraform.tfvars.example should have required variables', () => {
    const exampleVarsPath = path.join(infraRoot, 'terraform.tfvars.example')
    
    if (fs.existsSync(exampleVarsPath)) {
      const content = fs.readFileSync(exampleVarsPath, 'utf-8')
      
      expect(content).toMatch(/region/)
      expect(content).toMatch(/environment/)
      expect(content).toMatch(/container_image/)
    }
  })

  test('ECS task definition should exist', () => {
    const taskDefPath = path.join(__dirname, '../../../infrastructure/ecs-task-definition.json')
    expect(fs.existsSync(taskDefPath)).toBe(true)
  })

  test('ECS task definition should be valid JSON', () => {
    const taskDefPath = path.join(__dirname, '../../../infrastructure/ecs-task-definition.json')
    const content = fs.readFileSync(taskDefPath, 'utf-8')
    
    expect(() => JSON.parse(content)).not.toThrow()
  })

  test('ECS task definition should have required secrets', () => {
    const taskDefPath = path.join(__dirname, '../../../infrastructure/ecs-task-definition.json')
    const taskDef = JSON.parse(fs.readFileSync(taskDefPath, 'utf-8'))
    
    const secrets = taskDef.containerDefinitions[0].secrets || []
    const secretNames = secrets.map((s: any) => s.name)
    
    expect(secretNames).toContain('DATABASE_URL')
    expect(secretNames).toContain('NEXTAUTH_SECRET')
    expect(secretNames).toContain('NEXTAUTH_URL')
  })

  test('Terraform should not have sensitive data in version control', () => {
    const mainTfPath = path.join(infraRoot, 'main.tf')
    const content = fs.readFileSync(mainTfPath, 'utf-8')
    
    // Should not contain hardcoded secrets
    expect(content).not.toMatch(/password\s*=\s*["'][^"']*["']/)
    expect(content).not.toMatch(/access_key\s*=\s*["'][^"']*["']/)
    expect(content).not.toMatch(/secret_key\s*=\s*["'][^"']*["']/)
  })
})

