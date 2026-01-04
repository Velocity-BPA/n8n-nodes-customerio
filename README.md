# n8n-nodes-customerio

> **[Velocity BPA Licensing Notice]**
>
> This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).
>
> Use of this node by for-profit organizations in production environments requires a commercial license from Velocity BPA.
>
> For licensing information, visit https://velobpa.com/licensing or contact licensing@velobpa.com.

A comprehensive n8n community node for [Customer.io](https://customer.io), the leading messaging automation platform for data-driven companies. This node provides 13 resource categories and 60+ operations for customer data management, event tracking, transactional messaging, broadcasts, campaigns, and CDP functionality.

![n8n version](https://img.shields.io/badge/n8n-0.200+-blue)
![Node version](https://img.shields.io/badge/node-18+-green)
![License](https://img.shields.io/badge/license-BSL--1.1-blue)

## Features

- **Complete API Coverage**: Track API, App API, and Pipelines/CDP API
- **13 Resource Categories**: People, Events, Segments, Customers, Campaigns, Broadcasts, Transactional, Newsletters, Messages, Activities, Exports, Objects, and Pipelines
- **60+ Operations**: Full CRUD operations across all resources
- **Transactional Messaging**: Send emails, push notifications, and SMS
- **CDP Functionality**: Identify, track, page, screen, group, and alias operations
- **B2B Support**: Object relationships for companies, accounts, and courses
- **Webhook Triggers**: Real-time event notifications for all message types
- **Regional Support**: US and EU data center endpoints

## Installation

### Community Nodes (Recommended)

1. Open n8n
2. Go to **Settings** → **Community Nodes**
3. Click **Install a community node**
4. Enter `n8n-nodes-customerio`
5. Click **Install**

### Manual Installation

```bash
# Navigate to your n8n installation directory
cd ~/.n8n

# Install the package
npm install n8n-nodes-customerio
```

### Development Installation

```bash
# Clone the repository
git clone https://github.com/Velocity-BPA/n8n-nodes-customerio.git
cd n8n-nodes-customerio

# Install dependencies
npm install

# Build the project
npm run build

# Link to n8n
mkdir -p ~/.n8n/custom
ln -s $(pwd) ~/.n8n/custom/n8n-nodes-customerio

# Restart n8n
```

## Credentials Setup

You'll need credentials from your Customer.io account:

| Credential | Required | Description |
|------------|----------|-------------|
| Region | Yes | US or EU data center |
| Site ID | Yes | Found in Settings → API Keys |
| Track API Key | Yes | For data ingestion (Track API) |
| App API Key | Yes | For management operations (App API) |

### Getting Your API Keys

1. Log in to your [Customer.io account](https://fly.customer.io)
2. Go to **Settings** → **API Keys**
3. Copy your **Site ID** and **Track API Key** from the Track API section
4. Create an **App API Key** if you don't have one (requires Admin access)

## Resources & Operations

### People (Track API)
Manage customer profiles and devices.

| Operation | Description |
|-----------|-------------|
| Identify | Create or update a person |
| Delete Person | Delete a person by ID |
| Add Device | Add a mobile device token |
| Delete Device | Remove a device token |
| Suppress | Stop all messaging to a person |
| Unsuppress | Resume messaging to a person |
| Merge People | Merge two customer profiles |

### Events (Track API)
Track customer behavior and actions.

| Operation | Description |
|-----------|-------------|
| Track | Track an event for a person |
| Track Anonymous | Track an event without person ID |
| Track Page View | Track a page view event |

### Segments (App API)
View and manage dynamic customer groups.

| Operation | Description |
|-----------|-------------|
| List Segments | Get all segments |
| Get Segment | Get segment by ID |
| Get Segment Membership | Get people in a segment |

### Customers (App API)
Search and retrieve customer data.

| Operation | Description |
|-----------|-------------|
| List Customers | List customers with filters |
| Get Customer | Get customer by ID |
| Search Customers | Search customers (Beta API) |
| Get Customer Attributes | Get all attributes |
| Get Customer Segments | Get customer's segments |
| Get Customer Messages | Get messages sent to customer |
| Get Customer Activities | Get activity history |
| Export Customers | Export customer data |

### Campaigns (App API)
Manage automated campaign workflows.

| Operation | Description |
|-----------|-------------|
| List Campaigns | Get all campaigns |
| Get Campaign | Get campaign by ID |
| Get Campaign Metrics | Get performance metrics |
| Get Campaign Actions | Get campaign actions |
| Get Campaign Triggers | Get trigger conditions |
| List Campaign Messages | Get campaign messages |

### Broadcasts (App API)
Create and manage one-time broadcasts.

| Operation | Description |
|-----------|-------------|
| List Broadcasts | Get all broadcasts |
| Get Broadcast | Get broadcast by ID |
| Create Broadcast | Create a new broadcast |
| Trigger Broadcast | Trigger an API broadcast |
| Get Broadcast Metrics | Get performance metrics |
| Get Broadcast Actions | Get broadcast actions |
| List Broadcast Triggers | Get triggers |

### Transactional (App API)
Send triggered individual messages.

| Operation | Description |
|-----------|-------------|
| Send Email | Send transactional email |
| Send Push | Send push notification |
| Send SMS | Send SMS message |
| Get Transactional Status | Check delivery status |

### Newsletters (App API)
Manage newsletter campaigns.

| Operation | Description |
|-----------|-------------|
| List Newsletters | Get all newsletters |
| Get Newsletter | Get newsletter by ID |
| Get Newsletter Metrics | Get performance metrics |
| Get Newsletter Contents | Get content variants |

### Messages (App API)
View sent messages and deliveries.

| Operation | Description |
|-----------|-------------|
| List Messages | List sent messages |
| Get Message | Get message details |
| Get Message Templates | Get message templates |
| Get Message Deliveries | Get delivery information |

### Activities (App API)
View activity logs and events.

| Operation | Description |
|-----------|-------------|
| List Activities | List activities with filters |
| Get Activity | Get activity by ID |

### Exports (App API)
Export customer and delivery data.

| Operation | Description |
|-----------|-------------|
| List Exports | Get all exports |
| Get Export | Get export status |
| Create Export | Create a new export |
| Download Export | Download completed export |

### Objects (Track API)
Manage B2B objects and relationships.

| Operation | Description |
|-----------|-------------|
| Identify Object | Create/update an object |
| Delete Object | Delete an object |
| Add Relationship | Add person-object relationship |
| Remove Relationship | Remove relationship |

### Pipelines (CDP)
Customer Data Platform operations.

| Operation | Description |
|-----------|-------------|
| CDP Identify | Identify a user with traits |
| CDP Track | Track an event |
| CDP Page | Track a page view |
| CDP Screen | Track a screen view (mobile) |
| CDP Group | Associate user with a group |
| CDP Alias | Create an alias to merge identities |

## Trigger Node

The Customer.io Trigger node receives webhook events for real-time notifications.

### Supported Events

| Event | Description |
|-------|-------------|
| Email Sent | Email was sent |
| Email Delivered | Email was delivered |
| Email Opened | Email was opened |
| Email Clicked | Link in email was clicked |
| Email Bounced | Email bounced |
| Email Unsubscribed | Recipient unsubscribed |
| Email Complained | Marked as spam |
| Email Converted | Conversion tracked |
| Push Sent | Push notification sent |
| Push Opened | Push notification opened |
| Push Clicked | Push notification clicked |
| SMS Sent | SMS was sent |
| SMS Delivered | SMS was delivered |
| SMS Clicked | Link in SMS was clicked |
| Webhook Sent | Webhook was sent |
| Webhook Clicked | Webhook link was clicked |

### Webhook Setup

1. Add the Customer.io Trigger node to your workflow
2. Copy the webhook URL from the node
3. In Customer.io, go to **Data & Integrations** → **Integrations**
4. Find **Reporting Webhooks** and add your webhook URL
5. Select the events you want to receive

## Usage Examples

### Identify a Customer

```json
{
  "resource": "people",
  "operation": "identify",
  "identifier": "user123",
  "identifierType": "id",
  "attributes": {
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "plan": "premium"
  }
}
```

### Track an Event

```json
{
  "resource": "events",
  "operation": "track",
  "personId": "user123",
  "eventName": "purchase_completed",
  "eventData": {
    "product": "Pro Plan",
    "amount": 99.99,
    "currency": "USD"
  }
}
```

### Send Transactional Email

```json
{
  "resource": "transactional",
  "operation": "sendEmail",
  "transactionalMessageId": "1",
  "to": "user@example.com",
  "identifiers": {
    "id": "user123"
  },
  "messageData": {
    "orderNumber": "ORD-12345",
    "total": "$99.99"
  }
}
```

### Trigger a Broadcast

```json
{
  "resource": "broadcasts",
  "operation": "triggerBroadcast",
  "broadcastId": "123",
  "recipientType": "emails",
  "emails": ["user1@example.com", "user2@example.com"],
  "broadcastData": {
    "promoCode": "SAVE20"
  }
}
```

## Customer.io Concepts

| Concept | Description |
|---------|-------------|
| Person | A customer or user in your workspace |
| ID | Primary identifier for a person |
| Email | Can also be used as an identifier |
| Anonymous ID | Identifier for users before they're known |
| Event | An action or behavior you track |
| Attributes | Properties stored on a person profile |
| Segment | A dynamic group of people |
| Campaign | An automated message sequence |
| Broadcast | A one-time message to a segment |
| Transactional | A triggered individual message |
| Object | A non-person entity (company, course, etc.) |

## API Rate Limits

| API | Limit |
|-----|-------|
| Track API | 100 requests/second (soft limit) |
| App API | 10 requests/second |
| Transactional | 100 requests/second |
| Broadcast Trigger | 1 request/10 seconds |

## Error Handling

The node provides detailed error messages for common issues:

- **401 Unauthorized**: Invalid API credentials
- **404 Not Found**: Resource doesn't exist
- **429 Too Many Requests**: Rate limit exceeded
- **500 Internal Server Error**: Customer.io server error

## Security Best Practices

1. **Use environment variables** for API keys in production
2. **Enable webhook signature validation** for the trigger node
3. **Limit API key permissions** to only what's needed
4. **Rotate API keys** periodically
5. **Use EU endpoints** for GDPR compliance if needed

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Lint
npm run lint

# Fix linting issues
npm run lint:fix
```

## Author

**Velocity BPA**
- Website: [velobpa.com](https://velobpa.com)
- GitHub: [Velocity-BPA](https://github.com/Velocity-BPA)

## Licensing

This n8n community node is licensed under the **Business Source License 1.1**.

### Free Use
Permitted for personal, educational, research, and internal business use.

### Commercial Use
Use of this node within any SaaS, PaaS, hosted platform, managed service, or paid automation offering requires a commercial license.

For licensing inquiries:
**licensing@velobpa.com**

See [LICENSE](LICENSE), [COMMERCIAL_LICENSE.md](COMMERCIAL_LICENSE.md), and [LICENSING_FAQ.md](LICENSING_FAQ.md) for details.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Support

- 📖 [Customer.io Documentation](https://customer.io/docs/)
- 🐛 [Report Issues](https://github.com/Velocity-BPA/n8n-nodes-customerio/issues)
- 💬 [n8n Community](https://community.n8n.io/)

## Acknowledgments

- [Customer.io](https://customer.io) for their excellent API documentation
- [n8n](https://n8n.io) for the workflow automation platform
- The n8n community for feedback and contributions
