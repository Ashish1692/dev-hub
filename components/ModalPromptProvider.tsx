'use client';

import { createContext, useContext, useState } from 'react';
/**
 * name parameter is "actual value" of input.
 */
type InputConfig = {
	name: string;
	label?: string;
	placeholder?: string;
	defaultValue?: string;
};

type ModalConfig = {
	title: string;
	inputs?: InputConfig[];
};

type ModalContextType = {
	openModal: (config: ModalConfig) => Promise<Record<string, string> | null>;
};

const ModalContext = createContext<ModalContextType | null>(null);

export const useModalPrompt = () => {
	const ctx = useContext(ModalContext);
	if (!ctx) throw new Error('useModalPrompt must be used inside ModalPromptProvider');
	return ctx;
};

export function ModalPromptProvider({ children }: { children: React.ReactNode }) {
	const [config, setConfig] = useState<ModalConfig | null>(null);
	const [values, setValues] = useState<Record<string, string>>({});
	const [resolver, setResolver] =
		useState<((value: Record<string, string> | null) => void) | null>(null);

	const openModal = (cfg: ModalConfig) => {
		setConfig(cfg);

		const inputs =
			cfg.inputs && cfg.inputs.length > 0
				? cfg.inputs
				: [{ name: 'value', label: cfg.title }];

		setConfig({ ...cfg, inputs });

		const initialValues = Object.fromEntries(
			inputs.map(i => [i.name, i.defaultValue ?? ''])
		);
		setValues(initialValues);

		return new Promise<Record<string, string> | null>((resolve) => {
			setResolver(() => resolve);
		});
	};

	const close = (result: Record<string, string> | null) => {
		resolver?.(result);
		setResolver(null);
		setConfig(null);
	};

	return (
		<ModalContext.Provider value={{ openModal }}>
			{children}

			{config && (
				<div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
					<div className="bg-gray-800 rounded-xl p-6 w-full max-w-md">
						<h2 className="text-lg font-semibold mb-4">{config.title}</h2>

						<div className="space-y-3">
							{config.inputs?.map(input => (
								<div key={input.name}>
									<label className="text-sm font-medium">{input.label}</label>
									<input
										className="w-full border rounded-lg px-3 py-2 text-black"
										placeholder={input.placeholder}
										value={values[input.name]}
										onChange={(e) =>
											setValues(v => ({ ...v, [input.name]: e.target.value }))
										}
									/>
								</div>
							))}
						</div>

						<div className="flex justify-end gap-2 mt-5">
							<button
								className="px-4 py-2 rounded-lg bg-red-500"
								onClick={() => close(null)}
							>
								Cancel
							</button>
							<button
								className="px-4 py-2 rounded-lg bg-blue-600 text-white"
								onClick={() => close(values)}
							>
								OK
							</button>
						</div>
					</div>
				</div>
			)}
		</ModalContext.Provider>
	);
}
