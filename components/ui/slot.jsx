import React from 'react';

const Slot = React.forwardRef(({ children, ...props }, ref) => {
	if (!children) {
		return null;
	}

	// If children is a function, call it with the props
	if (typeof children === 'function') {
		return children(props);
	}

	// Clone the child and merge the props and ref
	return React.isValidElement(children)
		? React.cloneElement(children, {
			...props,
			...children.props,
			ref: ref
				? (node) => {
					// Merge refs
					if (typeof ref === 'function') ref(node);
					else if (ref) ref.current = node;

					const childRef = children.ref;
					if (typeof childRef === 'function') childRef(node);
					else if (childRef) childRef.current = node;
				}
				: children.ref,
		})
		: children;
});

Slot.displayName = 'Slot';

export { Slot };
