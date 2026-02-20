# BitSave Monitoring Setup Guide

## Overview

This guide provides comprehensive monitoring setup for BitSave protocol to ensure system health, security, and performance.

## System Health Monitoring

### Contract State Monitoring

#### Key Metrics to Track
```bash
# Contract pause status
curl -X POST "https://stacks-node-api.mainnet.stacks.co/v2/contracts/call-read/SP.../bitsave/is-paused" \
  -H "Content-Type: application/json" \
  -d '{"sender":"SP...","arguments":[]}'

# Current reward rate
curl -X POST "https://stacks-node-api.mainnet.stacks.co/v2/contracts/call-read/SP.../bitsave/get-reward-rate" \
  -H "Content-Type: application/json" \
  -d '{"sender":"SP...","arguments":[]}'

# Total value locked (custom calculation)
# Sum of all active deposits
```

#### Monitoring Script
```bash
#!/bin/bash
# monitor-contract-health.sh

CONTRACT_ADDRESS="SP..."
API_BASE="https://stacks-node-api.mainnet.stacks.co"

# Check contract pause status
PAUSE_STATUS=$(curl -s -X POST "$API_BASE/v2/contracts/call-read/$CONTRACT_ADDRESS/bitsave/is-paused" \
  -H "Content-Type: application/json" \
  -d '{"sender":"'$CONTRACT_ADDRESS'","arguments":[]}' | jq -r '.result')

if [ "$PAUSE_STATUS" = "true" ]; then
  echo "ALERT: Contract is paused!"
  # Send alert notification
fi

# Check reward rate
REWARD_RATE=$(curl -s -X POST "$API_BASE/v2/contracts/call-read/$CONTRACT_ADDRESS/bitsave/get-reward-rate" \
  -H "Content-Type: application/json" \
  -d '{"sender":"'$CONTRACT_ADDRESS'","arguments":[]}' | jq -r '.result')

echo "Current reward rate: $REWARD_RATE%"

# Log metrics
echo "$(date): pause=$PAUSE_STATUS, rate=$REWARD_RATE" >> /var/log/bitsave-health.log
```

### Performance Monitoring

#### Transaction Monitoring
```bash
#!/bin/bash
# monitor-transactions.sh

# Monitor recent transactions
RECENT_TXS=$(curl -s "$API_BASE/extended/v1/address/$CONTRACT_ADDRESS/transactions?limit=50")

# Count transaction types
DEPOSITS=$(echo "$RECENT_TXS" | jq '[.results[] | select(.contract_call.function_name == "deposit")] | length')
WITHDRAWALS=$(echo "$RECENT_TXS" | jq '[.results[] | select(.contract_call.function_name == "withdraw")] | length')

echo "Recent activity: $DEPOSITS deposits, $WITHDRAWALS withdrawals"

# Check for failed transactions
FAILED_TXS=$(echo "$RECENT_TXS" | jq '[.results[] | select(.tx_status == "abort_by_response")] | length')

if [ "$FAILED_TXS" -gt 5 ]; then
  echo "ALERT: High number of failed transactions: $FAILED_TXS"
fi
```

#### Gas Usage Monitoring
```bash
#!/bin/bash
# monitor-gas-usage.sh

# Analyze gas usage patterns
GAS_DATA=$(curl -s "$API_BASE/extended/v1/address/$CONTRACT_ADDRESS/transactions?limit=100")

# Calculate average gas usage
AVG_GAS=$(echo "$GAS_DATA" | jq '[.results[].fee_rate] | add / length')

echo "Average gas usage: $AVG_GAS"

# Alert on unusual gas spikes
if (( $(echo "$AVG_GAS > 1000" | bc -l) )); then
  echo "ALERT: High gas usage detected: $AVG_GAS"
fi
```

## Security Monitoring

### Anomaly Detection

#### Large Transaction Monitoring
```bash
#!/bin/bash
# monitor-large-transactions.sh

THRESHOLD=50000000000 # 50,000 STX in microSTX

# Monitor large deposits
LARGE_DEPOSITS=$(curl -s "$API_BASE/extended/v1/address/$CONTRACT_ADDRESS/transactions" | \
  jq --arg threshold "$THRESHOLD" '[.results[] | 
    select(.contract_call.function_name == "deposit" and 
           (.contract_call.function_args[0].repr | tonumber) > ($threshold | tonumber))]')

if [ "$(echo "$LARGE_DEPOSITS" | jq 'length')" -gt 0 ]; then
  echo "ALERT: Large deposit(s) detected"
  echo "$LARGE_DEPOSITS" | jq '.[] | {amount: .contract_call.function_args[0].repr, sender: .sender_address}'
fi
```

#### Suspicious Activity Detection
```bash
#!/bin/bash
# detect-suspicious-activity.sh

# Monitor rapid successive transactions from same address
RECENT_TXS=$(curl -s "$API_BASE/extended/v1/address/$CONTRACT_ADDRESS/transactions?limit=100")

# Group by sender and count
SENDER_COUNTS=$(echo "$RECENT_TXS" | jq -r '.results[] | .sender_address' | sort | uniq -c | sort -nr)

# Alert on addresses with >10 transactions in recent batch
echo "$SENDER_COUNTS" | while read count address; do
  if [ "$count" -gt 10 ]; then
    echo "ALERT: High activity from address $address: $count transactions"
  fi
done
```

### Access Control Monitoring
```bash
#!/bin/bash
# monitor-admin-actions.sh

# Monitor admin function calls
ADMIN_TXS=$(curl -s "$API_BASE/extended/v1/address/$CONTRACT_ADDRESS/transactions" | \
  jq '[.results[] | select(.contract_call.function_name | 
    test("pause|unpause|set-reward-rate|set-minimum-deposit"))]')

if [ "$(echo "$ADMIN_TXS" | jq 'length')" -gt 0 ]; then
  echo "Admin actions detected:"
  echo "$ADMIN_TXS" | jq '.[] | {function: .contract_call.function_name, sender: .sender_address, time: .burn_block_time_iso}'
fi
```

## User Experience Monitoring

### Success Rate Monitoring
```bash
#!/bin/bash
# monitor-success-rates.sh

# Calculate transaction success rates
RECENT_TXS=$(curl -s "$API_BASE/extended/v1/address/$CONTRACT_ADDRESS/transactions?limit=200")

TOTAL=$(echo "$RECENT_TXS" | jq '.results | length')
SUCCESS=$(echo "$RECENT_TXS" | jq '[.results[] | select(.tx_status == "success")] | length')
FAILED=$(echo "$RECENT_TXS" | jq '[.results[] | select(.tx_status != "success")] | length')

SUCCESS_RATE=$(echo "scale=2; $SUCCESS * 100 / $TOTAL" | bc)

echo "Success rate: $SUCCESS_RATE% ($SUCCESS/$TOTAL)"

if (( $(echo "$SUCCESS_RATE < 95" | bc -l) )); then
  echo "ALERT: Low success rate: $SUCCESS_RATE%"
fi
```

### Response Time Monitoring
```bash
#!/bin/bash
# monitor-response-times.sh

# Test API response times
start_time=$(date +%s%N)
curl -s "$API_BASE/v2/info" > /dev/null
end_time=$(date +%s%N)

response_time=$(( (end_time - start_time) / 1000000 )) # Convert to milliseconds

echo "API response time: ${response_time}ms"

if [ "$response_time" -gt 5000 ]; then
  echo "ALERT: High API response time: ${response_time}ms"
fi
```

## Alerting System

### Slack Integration
```bash
#!/bin/bash
# send-slack-alert.sh

SLACK_WEBHOOK="https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK"

send_alert() {
  local message="$1"
  local severity="$2"
  
  curl -X POST -H 'Content-type: application/json' \
    --data "{\"text\":\"🚨 BitSave Alert [$severity]: $message\"}" \
    "$SLACK_WEBHOOK"
}

# Usage
# send_alert "Contract paused unexpectedly" "HIGH"
```

### Email Alerts
```bash
#!/bin/bash
# send-email-alert.sh

send_email_alert() {
  local subject="$1"
  local message="$2"
  local recipient="admin@bitsave.example.com"
  
  echo "$message" | mail -s "BitSave Alert: $subject" "$recipient"
}

# Usage
# send_email_alert "High Gas Usage" "Average gas usage exceeded threshold: 1500"
```

### Discord Integration
```bash
#!/bin/bash
# send-discord-alert.sh

DISCORD_WEBHOOK="https://discord.com/api/webhooks/YOUR/WEBHOOK"

send_discord_alert() {
  local message="$1"
  local severity="$2"
  
  local color
  case "$severity" in
    "CRITICAL") color=16711680 ;; # Red
    "HIGH") color=16753920 ;; # Orange
    "MEDIUM") color=16776960 ;; # Yellow
    "LOW") color=65280 ;; # Green
  esac
  
  curl -H "Content-Type: application/json" \
    -d "{\"embeds\":[{\"title\":\"BitSave Alert\",\"description\":\"$message\",\"color\":$color}]}" \
    "$DISCORD_WEBHOOK"
}
```

## Automated Monitoring Setup

### Cron Jobs
```bash
# Add to crontab (crontab -e)

# Health check every 5 minutes
*/5 * * * * /path/to/monitor-contract-health.sh

# Transaction monitoring every 15 minutes
*/15 * * * * /path/to/monitor-transactions.sh

# Security monitoring every 10 minutes
*/10 * * * * /path/to/detect-suspicious-activity.sh

# Performance monitoring hourly
0 * * * * /path/to/monitor-gas-usage.sh

# Daily summary report
0 9 * * * /path/to/generate-daily-report.sh
```

### Systemd Service
```ini
# /etc/systemd/system/bitsave-monitor.service
[Unit]
Description=BitSave Monitoring Service
After=network.target

[Service]
Type=simple
User=monitor
ExecStart=/path/to/continuous-monitor.sh
Restart=always
RestartSec=30

[Install]
WantedBy=multi-user.target
```

### Docker Monitoring
```dockerfile
# Dockerfile for monitoring service
FROM ubuntu:20.04

RUN apt-get update && apt-get install -y \
    curl \
    jq \
    bc \
    mailutils \
    cron

COPY monitoring-scripts/ /opt/monitoring/
COPY crontab /etc/cron.d/bitsave-monitor

RUN chmod +x /opt/monitoring/*.sh
RUN crontab /etc/cron.d/bitsave-monitor

CMD ["cron", "-f"]
```

## Dashboard Setup

### Grafana Dashboard
```json
{
  "dashboard": {
    "title": "BitSave Protocol Monitoring",
    "panels": [
      {
        "title": "Contract Status",
        "type": "stat",
        "targets": [
          {
            "expr": "bitsave_contract_paused",
            "legendFormat": "Paused"
          }
        ]
      },
      {
        "title": "Transaction Volume",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(bitsave_deposits_total[5m])",
            "legendFormat": "Deposits/min"
          },
          {
            "expr": "rate(bitsave_withdrawals_total[5m])",
            "legendFormat": "Withdrawals/min"
          }
        ]
      },
      {
        "title": "Success Rate",
        "type": "stat",
        "targets": [
          {
            "expr": "bitsave_success_rate",
            "legendFormat": "Success Rate %"
          }
        ]
      }
    ]
  }
}
```

### Prometheus Metrics
```bash
#!/bin/bash
# export-metrics.sh

# Export metrics in Prometheus format
cat << EOF > /var/lib/prometheus/node-exporter/bitsave.prom
# HELP bitsave_contract_paused Contract pause status
# TYPE bitsave_contract_paused gauge
bitsave_contract_paused $PAUSE_STATUS

# HELP bitsave_reward_rate Current reward rate
# TYPE bitsave_reward_rate gauge
bitsave_reward_rate $REWARD_RATE

# HELP bitsave_deposits_total Total number of deposits
# TYPE bitsave_deposits_total counter
bitsave_deposits_total $TOTAL_DEPOSITS

# HELP bitsave_success_rate Transaction success rate
# TYPE bitsave_success_rate gauge
bitsave_success_rate $SUCCESS_RATE
EOF
```

## Log Management

### Centralized Logging
```bash
#!/bin/bash
# setup-logging.sh

# Configure rsyslog for BitSave logs
cat << EOF > /etc/rsyslog.d/50-bitsave.conf
# BitSave monitoring logs
local0.*    /var/log/bitsave/health.log
local1.*    /var/log/bitsave/security.log
local2.*    /var/log/bitsave/performance.log
EOF

systemctl restart rsyslog
```

### Log Rotation
```bash
# /etc/logrotate.d/bitsave
/var/log/bitsave/*.log {
    daily
    rotate 30
    compress
    delaycompress
    missingok
    notifempty
    create 644 monitor monitor
    postrotate
        systemctl reload rsyslog
    endscript
}
```

## Incident Response Automation

### Auto-Recovery Scripts
```bash
#!/bin/bash
# auto-recovery.sh

# Automatic recovery for common issues
if [ "$CONTRACT_PAUSED" = "true" ]; then
  # Check if pause was intentional
  RECENT_ADMIN_ACTIONS=$(check_recent_admin_actions)
  
  if [ -z "$RECENT_ADMIN_ACTIONS" ]; then
    echo "Unexpected pause detected - investigating..."
    # Run diagnostics
    # Alert administrators
    send_alert "Contract paused unexpectedly - manual intervention required" "CRITICAL"
  fi
fi

# Check for stuck transactions
PENDING_TXS=$(get_pending_transactions)
if [ "$PENDING_TXS" -gt 100 ]; then
  echo "High number of pending transactions detected"
  # Investigate mempool congestion
  # Suggest fee adjustments
fi
```

### Escalation Procedures
```bash
#!/bin/bash
# escalation.sh

escalate_alert() {
  local severity="$1"
  local message="$2"
  
  case "$severity" in
    "CRITICAL")
      # Immediate notification to all admins
      send_slack_alert "$message" "$severity"
      send_email_alert "CRITICAL ALERT" "$message"
      send_discord_alert "$message" "$severity"
      # SMS alerts for critical issues
      send_sms_alert "$message"
      ;;
    "HIGH")
      send_slack_alert "$message" "$severity"
      send_email_alert "HIGH PRIORITY" "$message"
      ;;
    "MEDIUM")
      send_slack_alert "$message" "$severity"
      ;;
    "LOW")
      # Log only, no immediate alerts
      logger -p local0.info "BitSave: $message"
      ;;
  esac
}
```

## Maintenance Windows

### Scheduled Maintenance
```bash
#!/bin/bash
# maintenance-window.sh

# Schedule maintenance window
MAINTENANCE_START="2024-02-01 02:00:00"
MAINTENANCE_END="2024-02-01 04:00:00"

# Notify users in advance
notify_maintenance_window() {
  local start_time="$1"
  local end_time="$2"
  
  # Update frontend with maintenance notice
  # Send community notifications
  # Update status page
}

# During maintenance
enter_maintenance_mode() {
  # Pause new deposits (if necessary)
  # Enable maintenance mode in frontend
  # Update monitoring thresholds
}

exit_maintenance_mode() {
  # Resume normal operations
  # Verify system health
  # Update status page
}
```

## Conclusion

This monitoring setup provides comprehensive coverage of:
- System health and performance
- Security and anomaly detection
- User experience metrics
- Automated alerting and recovery
- Incident response procedures

Regular review and updates of monitoring procedures ensure continued effectiveness as the protocol evolves.

## Resources

- [Stacks API Documentation](https://docs.hiro.so/api)
- [Prometheus Monitoring](https://prometheus.io/docs/)
- [Grafana Dashboards](https://grafana.com/docs/)
- [System Monitoring Best Practices](https://sre.google/sre-book/monitoring-distributed-systems/)
