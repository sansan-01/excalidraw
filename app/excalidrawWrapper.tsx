'use client';
import React, { useRef, useState } from 'react';
import {
  Excalidraw,
  convertToExcalidrawElements,
  restoreElements,
} from '@excalidraw/excalidraw';

const storageKey = 'excalidrawElements';
type SceneChangeHandler = NonNullable<React.ComponentProps<typeof Excalidraw>['onChange']>;

const ExcalidrawWrapper = () => {
  const [initialScene] = useState(() => {
    let storageError = null;
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved !== null) {
        const parsed: unknown = JSON.parse(saved);
        if (
          !Array.isArray(parsed) ||
          parsed.some((element) =>
            !element ||
            typeof element.id !== 'string' ||
            typeof element.type !== 'string' ||
            ![element.x, element.y, element.width, element.height].every(Number.isFinite) ||
            (element.groupIds != null && !Array.isArray(element.groupIds)),
          )
        ) {
          throw new Error('Invalid saved drawing');
        }

        const elements = restoreElements(parsed, null, { repairBindings: true });
        return { elements, saved, storageError };
      }
    } catch {
      storageError = 'The saved drawing could not be read. Automatic saving is paused.';
    }

    const elements = convertToExcalidrawElements([
      {
        type: 'rectangle',
        id: 'rect-1',
        x: 350,
        y: 100,
        width: 100,
        height: 100,
        backgroundColor: '#ffd700',
        fillStyle: 'solid',
      },
      {
        type: 'ellipse',
        id: 'circle-1',
        x: 500,
        y: 100,
        width: 100,
        height: 100,
        backgroundColor: '#4a90e2',
        fillStyle: 'solid',
      },
      {
        type: 'diamond',
        id: 'triangle-1',
        x: 650,
        y: 100,
        width: 100,
        height: 100,
        backgroundColor: '#ff0000',
        fillStyle: 'solid',
      },
    ]);
    return { elements, saved: null, storageError };
  });

  const lastSaved = useRef(initialScene.saved);
  const [storageError, setStorageError] = useState(initialScene.storageError);

  const onChange: SceneChangeHandler = (elements) => {
    if (initialScene.storageError) {
      return;
    }

    try {
      const serialized = JSON.stringify(elements);
      if (localStorage.getItem(storageKey) !== lastSaved.current) {
        setStorageError('The saved drawing changed while this tab was open. Automatic saving is paused.');
        return;
      }

      if (serialized !== lastSaved.current) {
        localStorage.setItem(storageKey, serialized);
        lastSaved.current = serialized;
      }
      setStorageError(null);
    } catch {
      setStorageError('The drawing could not be saved to this browser.');
    }
  };

  return (
    <div style={{ height: '100vh', width: '100vw' }}>
      <Excalidraw
        initialData={{
          elements: initialScene.elements,
          appState: {
            viewBackgroundColor: '#FFFFFF',
          },
        }}
        onChange={onChange}
      />
      {storageError && (
        <p role="status" className="fixed bottom-20 left-1/2 z-50 -translate-x-1/2 rounded bg-white px-3 py-2 text-sm text-black shadow">
          {storageError} Export your drawing to keep a copy.
        </p>
      )}
    </div>
  );
};

export default ExcalidrawWrapper;
