# Alai Coding Challenge: Hub and Spoke Implementation

The goal of the challenge is to create a hub and spoke diagram similar to ![Hub and Spoke Example](https://storage.getalai.com/hub-and-spoke-2.png)

## Getting Started

1. Clone this repository
2. Install dependencies:
   ```
   npm install
   ```
3. Run the development server:
   ```
   npm run dev
   ```
4. Open your browser and navigate to `http://localhost:5173` (or the port shown in your terminal)


## Project Structure

- `src/App.tsx`: Main application component
- `src/TldrawComponent.tsx`: TLDraw canvas implementation (You'll likely need to modify this)

## Notes

1. Allow the user to add/remove spokes. This could be through simple buttons outside the canvas. The diagram should support 2-6 spokes

2. Extra credit: Improve diagram functionality through:

   - When the user moves some spoke text then move the associated spoke line automatically with it. Hint: https://examples.tldraw.com/layout-bindings
   - Prevent collisions between spoke textboxes
   - Moving the hub around moves the entire diagram

3. Please do not spend time on the UI outside the hub and spoke diagram. The sidebar or buttons do not need to be fancy.


## Resources

- [TLDraw Documentation](https://tldraw.dev/)
- [React Documentation](https://reactjs.org/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)

