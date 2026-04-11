#!/usr/bin/env tsx
/**
 * Database Health Check Tool
 * 
 * This script checks the health of your Supabase database connection,
 * verifies table existence, and checks storage bucket accessibility.
 * 
 * Usage:
 *   npx tsx scripts/check-db-health.ts
 * 
 * Or add to package.json:
 *   "scripts": {
 *     "db:health": "tsx scripts/check-db-health.ts"
 *   }
 */

import { executeDatabaseHealthCheck } from '../lib/supabase/health-check'

async function main() {
  console.log('🔍 Checking database health...\n')

  try {
    const health = await executeDatabaseHealthCheck()

    console.log('📊 Health Check Results:')
    console.log('─'.repeat(50))
    console.log(`Status: ${health.status === 'healthy' ? '✅ HEALTHY' : '❌ UNHEALTHY'}`)
    console.log(`Timestamp: ${health.timestamp}\n`)

    console.log('🗄️  Database:')
    console.log(
      `  Connection: ${health.database.connected ? '✅ Connected' : '❌ Failed'}`
    )
    if (health.database.error) {
      console.log(`  Error: ${health.database.error}`)
    }

    console.log('\n📦 Storage:')
    console.log(
      `  Accessible: ${health.storage.accessible ? '✅ Yes' : '❌ No'}`
    )
    if (health.storage.error) {
      console.log(`  Error: ${health.storage.error}`)
    }

    console.log('\n📋 Tables:')
    console.log(
      `  Articles: ${health.tables.articles.exists ? '✅ Exists' : '❌ Missing'}`
    )
    if (health.tables.articles.rowCount !== undefined) {
      console.log(`  Row Count: ${health.tables.articles.rowCount}`)
    }
    if (health.tables.articles.error) {
      console.log(`  Error: ${health.tables.articles.error}`)
    }

    console.log(
      `  Writers: ${health.tables.writers.exists ? '✅ Exists' : '❌ Missing'}`
    )
    if (health.tables.writers.rowCount !== undefined) {
      console.log(`  Row Count: ${health.tables.writers.rowCount}`)
    }
    if (health.tables.writers.error) {
      console.log(`  Error: ${health.tables.writers.error}`)
    }

    console.log(
      `  Product Cards: ${health.tables.product_cards.exists ? '✅ Exists' : '❌ Missing'}`
    )
    if (health.tables.product_cards.rowCount !== undefined) {
      console.log(`  Row Count: ${health.tables.product_cards.rowCount}`)
    }
    if (health.tables.product_cards.error) {
      console.log(`  Error: ${health.tables.product_cards.error}`)
    }

    console.log('\n' + '─'.repeat(50))

    if (health.status === 'healthy') {
      console.log('✅ All systems operational!')
      process.exit(0)
    } else {
      console.log('❌ Some issues detected. Please check the errors above.')
      process.exit(1)
    }
  } catch (error) {
    console.error('❌ Fatal error during health check:')
    console.error(error instanceof Error ? error.message : error)
    process.exit(1)
  }
}

main()
