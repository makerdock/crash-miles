# Farcaster Mini Apps Documentation

## Getting Started

### Overview
Mini apps are web apps built with HTML, CSS, and Javascript that can be discovered and used within Farcaster clients. You can use an SDK to access native Farcaster features, like authentication, sending notifications, and interacting with the user's wallet.

### Quick Start
For new projects, you can set up an app using the [@farcaster/create-mini-app](https://github.com/farcasterxyz/frames/tree/main/packages/create-mini-app) CLI. This will prompt you to set up a project for your app.

```bash
# npm
npm create @farcaster/mini-app

# pnpm  
pnpm create @farcaster/mini-app

# yarn
yarn create @farcaster/mini-app
```

Remember, you can use whatever your favorite web framework is to build Mini Apps so if these options aren't appealing you can setup the SDK in your own project by following the instructions below.

### Manual Setup
For existing projects, install the Frames SDK:

#### Package Manager
```bash
# npm
npm install @farcaster/frame-sdk

# pnpm
pnpm add @farcaster/frame-sdk

# yarn  
yarn add @farcaster/frame-sdk
```

#### CDN
If you're not using a package manager, you can also use the Frame SDK via an ESM-compatible CDN such as esm.sh. Simply add a script tag:

```html
<script type="module">
import { sdk } from 'https://esm.sh/@farcaster/frame-sdk'
</script>
```

### Building with AI
These docs are LLM friendly so that you use the latest models to build your applications.

1. Use the Ask in ChatGPT buttons available on each page to interact with the documentation
2. Use the llms-full.txt to keep your LLM up to date with these docs

#### How does this work?
This entire site is converted into a single markdown doc that can fit inside the context window of most LLMs. See [The /llms.txt file](https://llmstxt.org/) standards proposal for more information.

### Next Steps
You'll need to do a few more things before distributing your app to users:
1. publish the app by providing information about who created it and how it should displayed
2. make it sharable in feeds

## Specification

A Mini App is a web application that renders inside a Farcaster client.

### Mini App Embed
The primary discovery points for Mini Apps are social feeds. Mini App Embeds are an OpenGraph-inspired metadata standard that lets any page in a Mini App be rendered as a rich object that can launch user into an application.

#### Versioning
Mini App Embeds will follow a simple versioning scheme where non-breaking changes can be added to the same version but a breaking change must accompany a version bump.

#### Metatags
A Mini App URL must have a FrameEmbed in a serialized form in the `fc:frame` meta tag in the HTML `<head>`. When this URL is rendered in a cast, the image is displayed in a 3:2 ratio with a button underneath. Clicking the button will open a Mini App to the provided action url and use the splash page to animate the transition.

```html
<meta name="fc:frame" content='{"version":"next","imageUrl":"https://yoink.party/framesV2/opengraph-image","button":{"title":"🚩 Start","action":{"type":"launch_frame","name":"Yoink!","url":"https://yoink.party/framesV2","splashImageUrl":"https://yoink.party/logo.png","splashBackgroundColor":"#f5f0ec"}}}' />
```

#### Schema
| Property | Type | Required | Description | Constraints |
|----------|------|----------|-------------|-------------|
| version | string | Yes | Version of the embed. | Must be "1" or "next" |
| imageUrl | string | Yes | Image url for the embed | Max 1024 characters. Must be 3:2 aspect ratio. |
| button | object | Yes | Button | |

##### Button Schema
| Property | Type | Required | Description | Constraints |
|----------|------|----------|-------------|-------------|
| title | string | Yes | Mini App name. | Max length 32 characters |
| action | object | Yes | Action | Max length 1024 characters. |

##### Action Schema
| Property | Type | Required | Description | Constraints |
|----------|------|----------|-------------|-------------|
| type | string | Yes | The type of action. | One of: `launch_frame`, `view_token` |
| url | string | No | App URL to open. If not provided, defaults to full URL used to fetch the document. | Max length 1024 characters. |
| name | string | No | Name of the application | |
| splashImageUrl | string | No | URL of image to show on loading screen. | Max length 32 characters. Must be 200x200px. |
| splashBackgroundColor | string | No | Hex color code to use on loading screen. | Hex color code. |

##### Example
```json
{
  "version": "next",
  "imageUrl": "https://yoink.party/framesV2/opengraph-image",
  "button": {
    "title": "🚩 Start",
    "action": {
      "type": "launch_frame",
      "name": "Yoink!",
      "url": "https://yoink.party/framesV2",
      "splashImageUrl": "https://yoink.party/logo.png",
      "splashBackgroundColor": "#f5f0ec"
    }
  }
}
```

### App Surface

#### Header
Hosts should render a header above the Mini App that includes the name and author specified in the manifest. Clients should show the header whenever the Mini App is launched.

#### Splash Screen
Hosts should show a splash screen as soon as the app is launched. The icon and background must be specified in the Mini App manifest or embed meta tags. The Mini App can hide the splash screen once loading is complete.

#### Size & Orientation
A Mini App should be rendered in a vertical modal. Mobile Mini App sizes should be dictated by device dimensions while web Mini App sizes should be set to 424x695px.

### SDK
Mini Apps can communicate with their Host using a JavaScript SDK. At this time there is no formal specification for the message passing format, Hosts and Apps should use the open-source NPM packages that can be found in the [farcasterxyz/miniapps](https://github.com/farcasterxyz/miniapps) repo. This SDK facilitates communication over a `postMessage` channel available in iframes and mobile WebViews.

#### Versioning
The SDK is versioned using [Semantic Versioning](https://semver.org/). A [What's New page](/docs/sdk/changelog) is maintained to communicate developer impacting changes. A [lower level changelog](https://github.com/farcasterxyz/miniapps/blob/main/packages/frame-sdk/CHANGELOG.md) is maintained within the code base to document all changes.

#### API
* [context](/docs/sdk/context) - provides information about the context the Mini App is running in

##### Actions
* [addMiniApp](/docs/sdk/actions/add-frame) - Prompts the user to add the Mini App
* [close](/docs/sdk/actions/close) - Closes the Mini App
* [composeCast](/docs/sdk/actions/compose-cast) - Prompt the user to cast
* [ready](/docs/sdk/actions/ready) - Hides the Splash Screen
* [signin](/docs/sdk/actions/sign-in) - Prompts the user to Sign In with Farcaster
* [openUrl](/docs/sdk/actions/open-url) - Open an external URL
* [viewProfile](/docs/sdk/actions/view-profile) - View a Farcaster profile

## SDK Actions Reference

### ready
Hides the Splash Screen. Read the [guide on loading your app](/docs/guides/loading) for best practices.

#### Usage
```ts
import { sdk } from '@farcaster/frame-sdk'
await sdk.actions.ready()
```

#### Parameters
- **disableNativeGestures** (optional)
  - **Type:** `boolean`
  - **Default:** `false`
  - Disable native gestures. Use this option if your frame uses gestures that conflict with native gestures like swipe to dismiss.

#### Return Value
`void`

### sendToken
Open the send form with a pre-filled token and recipient. The user will be able to modify the send before executing the transaction.

#### Usage
```ts
const token = "eip155:8453/erc20:0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";
const amount = "1000000";
const recipientFid = 3;

import { sdk } from '@farcaster/frame-sdk'
await sdk.actions.sendToken({
  token,
  amount,
  recipientFid,
})
```

#### Parameters
- **token** (optional)
  - **Type:** `string`
  - CAIP-19 asset ID
  - For example, Base USDC: eip155:8453/erc20:0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913

- **amount** (optional)
  - **Type:** `string`
  - Send token amount, as numeric string
  - For example, 1 USDC: 1000000

- **recipientAddress** (optional)
  - **Type:** `string`
  - Address to send the token to
  - For example, 0xd8da6bf26964af9d7eed9e03e53415d37aa96045

- **recipientFid** (optional)
  - **Type:** `number`
  - FID to send the token to
  - For example, dwr: 3

#### Return Value
```ts
type SendTokenDetails = {
  /** Tx identifier. */
  transaction: `0x${string}`
}

type SendTokenErrorDetails = {
  /** Error code. */
  error: string
  /** Error message. */
  message?: string
}

export type SendTokenErrorReason = 'rejected_by_user' | 'send_failed'

export type SendTokenResult = 
  | { success: true; send: SendTokenDetails }
  | { success: false; reason: SendTokenErrorReason; error?: SendTokenErrorDetails }
```

### signIn
Request a [Sign in with Farcaster (SIWF)](https://docs.farcaster.xyz/developers/siwf/) credential from the user. See the guide on [authenticating users](/docs/guides/auth).

#### Usage
```ts
/** Cryptographically secure nonce generated on the server and associated with the user's session. */
const nonce = 'securenonce';

import { sdk } from '@farcaster/frame-sdk'
await sdk.actions.signIn({
  nonce,
  acceptAuthAddress: true
})
```

#### Parameters
- **nonce**
  - **Type:** `string`
  - A random string used to prevent replay attacks, at least 8 alphanumeric characters.

- **acceptAuthAddress**
  - **Type:** `boolean`
  - Whether an [Auth Address](https://github.com/farcasterxyz/protocol/discussions/225) signed message is acceptable. Defaults to `false` to maintain backwards compatibility, though applications should set this to `true` for the best user experience assuming their verification method supports it.

#### Return Value
The SIWF message and signature.
```ts
type SignInResult = {
  signature: string;
  message: string;
}
```

> **Note:** This message must be sent to your server and verified. See the guide on [authenticating with Farcaster](/docs/guides/auth) for more information.

### swapToken
Open the swap form with pre-filled tokens. The user will be able to modify the swap before executing the transaction.

#### Usage
```ts
const sellToken = "eip155:8453/erc20:0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";
const buyToken = "eip155:10/native";
const sellAmount = "1000000";

import { sdk } from '@farcaster/frame-sdk'
await sdk.actions.swapToken({
  sellToken,
  buyToken,
  sellAmount,
})
```

#### Parameters
- **sellToken** (optional)
  - **Type:** `string`
  - CAIP-19 asset ID
  - For example, Base USDC: eip155:8453/erc20:0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913

- **buyToken** (optional)
  - **Type:** `string`
  - CAIP-19 asset ID
  - For example, OP ETH: eip155:10/native

- **sellAmount** (optional)
  - **Type:** `string`
  - Sell token amount, as numeric string
  - For example, 1 USDC: 1000000

#### Return Value
```ts
type SwapTokenDetails = {
  /** Array of tx identifiers in order of execution. Some swaps will have both an approval and swap tx. */
  transactions: `0x${string}`[];
};

type SwapTokenErrorDetails = {
  /** Error code. */
  error: string;
  /** Error message. */
  message?: string;
};

export type SwapErrorReason = "rejected_by_user" | "swap_failed";

export type SwapTokenResult = 
  | { success: true; swap: SwapTokenDetails; }
  | { success: false; reason: SwapErrorReason; error?: SwapTokenErrorDetails; };
```

### viewCast
Open a specific cast in the Farcaster client. This navigates the user to view the full cast with its replies and reactions.

#### Usage
```ts
const castHash = "0x1234567890abcdef";

import { sdk } from '@farcaster/frame-sdk'
await sdk.actions.viewCast({
  hash: castHash,
})
```

#### Parameters
- **hash**
  - **Type:** `string`
  - The hash of the cast to view. This should be a valid cast hash from the Farcaster protocol.

- **close** (optional)
  - **Type:** `boolean`
  - Whether the app should be closed when this action is called. If true, the app will be closed after opening the cast view.

#### Return Value
`Promise<void>` - This action does not return a value. It triggers navigation to the cast view in the Farcaster client.

#### Examples
```ts
import { sdk } from "@farcaster/frame-sdk";

// View a specific cast
await sdk.actions.viewCast({
  hash: "0x1234567890abcdef"
})

// View a cast and close the mini app
await sdk.actions.viewCast({
  hash: "0x1234567890abcdef",
  close: true
})
```

### viewProfile
Displays a user's Farcaster profile.

#### Usage
```ts
const fid = 6841;

import { sdk } from '@farcaster/frame-sdk'
await sdk.actions.viewProfile({ fid })
```

#### Parameters
- **fid**
  - **Type:** `number`
  - Farcaster ID of the user who's profile to view.

#### Return Value
`void`

### viewToken
Displays a token

#### Usage
```ts
const token = "eip155:8453/erc20:0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";

import { sdk } from '@farcaster/frame-sdk'
await sdk.actions.viewToken({ token })
```

#### Parameters
- **token**
  - **Type:** `string`
  - CAIP-19 asset ID
  - For example, Base USDC: eip155:8453/erc20:0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913

#### Return Value
`void`

## Authentication & Security

### Server-Side Verification Example
```typescript
import { Hono } from 'hono'
import { NeynarAPIClient, Configuration } from '@neynar/nodejs-sdk'

const app = new Hono()
const client = new NeynarAPIClient(
  new Configuration({ apiKey: process.env.NEYNAR_API_KEY })
)

app.post('/api/verify', async (c) => {
  const { message, signature, nonce } = await c.req.json()
  
  // Verify nonce matches expected value for this session
  // Implementation depends on your session management
  
  try {
    const { isValid, fid } = await client.validateFrameMessage(message)
    
    if (!isValid) {
      return c.json({ error: 'Invalid signature' }, 401)
    }
    
    // User is authenticated with FID
    return c.json({ fid })
    
  } catch (error) {
    return c.json({ error: 'Verification failed' }, 500)
  }
})

export default app
```

## Best Practices

1. **Always call `sdk.actions.ready()`** after your app has finished loading to hide the splash screen
2. **Implement proper error handling** for all SDK actions
3. **Use server-side verification** for authentication tokens
4. **Test your Mini App** in different Farcaster clients
5. **Keep your embed metadata up to date** with accurate descriptions and images
6. **Handle network failures gracefully** as users may have poor connectivity
7. **Optimize for mobile first** since most users will access via mobile clients

## Troubleshooting

### Common Issues
- **Splash screen not hiding**: Make sure to call `sdk.actions.ready()` after your app loads
- **Authentication failing**: Verify your server-side validation logic and nonce generation
- **Actions not working**: Check that you're using the correct SDK version and parameters
- **Embed not displaying**: Validate your metadata format and image requirements

### Resources
- [Farcaster Mini Apps GitHub Repository](https://github.com/farcasterxyz/miniapps)  
- [Official Documentation](https://miniapps.farcaster.xyz/)
- [SDK Changelog](https://github.com/farcasterxyz/miniapps/blob/main/packages/frame-sdk/CHANGELOG.md) 