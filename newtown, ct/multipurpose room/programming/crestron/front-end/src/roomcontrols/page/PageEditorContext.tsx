import React from 'react';

export type PageEditorContextValue = {
	openPageEditor: (content: React.ReactNode) => void;
	closePageEditor: () => void;
	isPageEditorOpen: boolean;
};

const PageEditorContext = React.createContext<PageEditorContextValue | null>(null);

const ActivePageContext = React.createContext<string | undefined>(undefined);
const DisplayedPageContext = React.createContext<string | undefined>(undefined);

export function ActivePageProvider(props: {
	activePageId: string | undefined;
	displayedPageId: string | undefined;
	children: React.ReactNode;
}) {
	return (
		<ActivePageContext.Provider value={props.activePageId}>
			<DisplayedPageContext.Provider value={props.displayedPageId}>
				{props.children}
			</DisplayedPageContext.Provider>
		</ActivePageContext.Provider>
	);
}

export function useActivePageId(): string | undefined {
	return React.useContext(ActivePageContext);
}

export function useDisplayedPageId(): string | undefined {
	return React.useContext(DisplayedPageContext);
}

export type PageEditorProviderProps = {
	children: React.ReactNode;
	editorContent: React.ReactNode | null;
	onOpenEditor: (content: React.ReactNode) => void;
	onCloseEditor: () => void;
};

export function PageEditorProvider(props: PageEditorProviderProps) {
	const value = React.useMemo<PageEditorContextValue>(() => ({
		openPageEditor: props.onOpenEditor,
		closePageEditor: props.onCloseEditor,
		isPageEditorOpen: props.editorContent !== null,
	}), [props.onOpenEditor, props.onCloseEditor, props.editorContent]);

	return (
		<PageEditorContext.Provider value={value}>
			{props.children}
		</PageEditorContext.Provider>
	);
}

export function usePageEditor(): PageEditorContextValue | null {
	return React.useContext(PageEditorContext);
}
