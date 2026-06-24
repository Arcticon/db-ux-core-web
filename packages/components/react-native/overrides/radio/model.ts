import { type GestureResponderEvent } from 'react-native';
import type {
	FormCheckProps,
	FormProps,
	FormState,
	GlobalProps,
	GlobalState,
	InitializedState,
	SizeProps,
	ValueProps
} from '../../shared/model';

export type DBRadioDefaultProps = {};

export type DBRadioProps = DBRadioDefaultProps &
	GlobalProps &
	FormProps &
	FormCheckProps &
	SizeProps & {
		onChange?: (
			event: GestureResponderEvent,
			value: ValueProps['value']
		) => void;
	};

export type DBRadioDefaultState = {};

export type DBRadioState = DBRadioDefaultState &
	GlobalState &
	FormState &
	InitializedState;
