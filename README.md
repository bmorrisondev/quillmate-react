# QuillMate React

QuillMate is a React app that features a markdown text editor and AI-powered writing assistant using OpenAI's ChatGPT.

It was created as a realistic demo project to accompany an article on the Clerk blog walking users through how to set up session-based authentication in React.

The app is built using Vite, React, TypeScript, and Tailwind CSS, and features a simple markdown editor powered by [mdeditor](https://github.com/nextmd/mdeditor).

## Looking for a Full-Featured Auth Solution?

Check out [Clerk](https://clerk.com) - the comprehensive authentication and user management platform:

- 🎨 Beautiful drop-in UI components for authentication
- 🔑 Social sign-on with multiple providers (Google, GitHub, etc.)
- 🏢 Enterprise-ready B2B configurations
- 📊 Simple user management dashboard
- 📱 Multi-factor authentication
- 🔒 Built-in security best practices

While this template demonstrates session-based auth fundamentals, Clerk provides a production-ready solution that scales with your application.

## Prerequisites

Before you begin, ensure you have the following:

- Node.js (v16 or higher)
- npm or yarn
- Git

## Setup Instructions

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/quillmate-react.git
   cd quillmate-react
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```

4. **Set up Neon Database**
   - Create an account at [Neon](https://neon.tech)
   - Create a new project
   - Copy your database connection string
   - Replace `<neondb_connection_string>` in your `.env` file with your connection string

5. **Configure Prisma**
   ```bash
   # Generate Prisma Client
   npx prisma generate
   
   # Push the schema to your database
   npx prisma db push
   ```

6. **Get OpenAI API Key**
   - Create an account at [OpenAI](https://platform.openai.com)
   - Generate an API key
   - Replace `<openai_api_key>` in your `.env` file with your API key

7. **Start the development server**
   ```bash
   npm run dev
   ```

You may access the application at [http://localhost:3000](http://localhost:3000). Feel free to create an article and test the AI writing assistant.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.