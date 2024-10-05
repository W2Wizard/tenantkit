FROM oven/bun:1 AS base
WORKDIR /usr/src/app

# Install dependencies into a temp directory (for caching)
FROM base AS install
RUN mkdir -p /temp/dev
COPY package.json bun.lockb /temp/dev/
RUN cd /temp/dev && bun install --frozen-lockfile

# Install production dependencies (excluding devDependencies)
RUN mkdir -p /temp/prod
COPY package.json bun.lockb /temp/prod/
RUN cd /temp/prod && bun install --frozen-lockfile --production

# Copy node_modules from the temp directory and project files
FROM base AS builder
COPY --from=install /temp/dev/node_modules node_modules
COPY . .
RUN bun run build

# Create the final production image with the necessary files
FROM base AS release
WORKDIR /usr/src/app
COPY --from=install /temp/prod/node_modules node_modules
COPY --from=builder /usr/src/app/build build/
COPY package.json .

# Set environment variables
ENV NODE_ENV=production
EXPOSE 3000
ENTRYPOINT [ "bun", "run", "build" ]
