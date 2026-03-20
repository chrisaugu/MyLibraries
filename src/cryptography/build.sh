bun build --compile --target=bun-windows-x64 ./app.ts --outfile myapp

# To support CPUs from before 2013, use the baseline version (nehalem)
bun build --compile --target=bun-windows-x64-baseline ./app.ts --outfile myapp

# To explicitly only support CPUs from 2013 and later, use the modern version (haswell)
bun build --compile --target=bun-windows-x64-modern ./app.ts --outfile myapp