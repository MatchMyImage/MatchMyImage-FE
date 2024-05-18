import { useMemo, useState } from 'react';
import { Dimensions, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Controller, useFormContext } from 'react-hook-form';
import DropDownPicker from 'react-native-dropdown-picker';
import { getStatusBarHeight } from 'react-native-status-bar-height';
import { NativeStackScreenProps } from 'react-native-screens/native-stack';
import { HelperText } from 'react-native-paper';

import { theme } from 'styles/theme';
import { isAos } from 'utils/device';
import { RootStackParamList } from 'types/shared';

type Props = NativeStackScreenProps<RootStackParamList, 'SIGN_UP_USER_INFO'>;

const UserInfo = ({ navigation: { navigate } }: Props) => {
  const {
    control,
    watch,
    setValue,
    formState: { errors, dirtyFields },
    setError,
    clearErrors,
  } = useFormContext();

  const [selectBoxOpen, setSelectBoxOpen] = useState<boolean>(false);

  const nickname = watch('nickname');
  const birthday = watch('birthday');
  const gender = watch('gender');

  const isButtonDisabled = useMemo(() => !(nickname && birthday && gender), [nickname, birthday, gender]);

  const selectItems = [
    { label: '남성', value: 'male' },
    { label: '여성', value: 'female' },
  ];

  const onChangeBirthday = (inputText: string) => {
    // 입력된 텍스트에서 숫자만 추출하여 변환
    const formattedInput = inputText.replace(/\D/g, '');
    // 형식에 맞게 변환된 텍스트 설정
    if (formattedInput.length >= 4 && formattedInput.length < 6) {
      // 월까지 입력된 경우
      setValue('birthday', formattedInput.replace(/(\d{4})(\d{1,2})/, '$1. $2'));
    } else if (formattedInput.length === 6) {
      setValue('birthday', formattedInput.replace(/(\d{4})(\d{2})/, '$1. $2'));
    } else if (formattedInput.length > 6) {
      // 일까지 입력된 경우
      setValue('birthday', formattedInput.replace(/(\d{4})(\d{2})(\d{1,2})/, '$1. $2. $3'));
    } else {
      // 연도만 입력된 경우
      setValue('birthday', formattedInput);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.inputSection}>
        <View style={styles.titleWrap}>
          <Text style={styles.titleBold}>사용자 정보를</Text>
          <Text style={styles.titleNormal}>입력해주세요</Text>
        </View>
        <View style={styles.formContainer}>
          <Text
            style={[
              styles.label,
              errors.nickname && styles.error,
              !errors.nickname && dirtyFields.nickname && styles.valid,
            ]}
          >
            닉네임
          </Text>
          <Controller
            name="nickname"
            control={control}
            render={({ field: { onChange, value } }) => (
              <>
                <TextInput
                  style={[
                    styles.input,
                    errors.nickname && styles.errorBorder,
                    !errors.nickname && dirtyFields.nickname && styles.validBorder,
                  ]}
                  placeholder="닉네임을 입력해주세요"
                  onChangeText={onChange}
                  onBlur={() => {
                    if (!dirtyFields.nickname) return;

                    if (nickname.length < 2 || nickname.length > 7) {
                      setError('nickname', { type: 'nickname', message: '* 닉네임 길이 조건을 확인해주세요.' });
                      return;
                    }

                    if (nickname.match(/[^ㄱ-ㅎㅏ-ㅣ가-힣a-zA-Z0-9/]/)) {
                      setError('nickname', { type: 'nickname', message: '* 띄워쓰기, 특수문자는 사용할 수 없어요.' });
                      return;
                    }

                    clearErrors('nickname');
                  }}
                  value={value}
                />
                {/*{errors.nickname && <HelperText type="error">{errors.nickname?.message}</HelperText>}*/}
              </>
            )}
          />
          {errors.nickname ? (
            <HelperText type="error" padding="none" style={[styles.message, styles.error]}>
              {errors.nickname.message as string}
            </HelperText>
          ) : (
            <HelperText
              type="info"
              padding="none"
              style={[styles.message, dirtyFields.nickname ? styles.valid : styles.default]}
            >
              {dirtyFields.nickname ? '사용 가능한 닉네임이에요.' : '* 최소 2자 ~ 최대 7글자 입력 가능합니다.'}
            </HelperText>
          )}
        </View>
        <View style={styles.formContainer}>
          <Controller
            name="birthday"
            control={control}
            rules={{ required: true, maxLength: 12 }}
            render={({ field: { onBlur, value } }) => (
              <>
                <Text style={[styles.label, errors.birthday && styles.error]}>생년월일</Text>
                <TextInput
                  style={[styles.input, errors.birthday && styles.error]}
                  placeholder="YYYY / MM / DD"
                  keyboardType="numeric"
                  value={value}
                  maxLength={12}
                  onChangeText={onChangeBirthday}
                  onBlur={onBlur}
                />
              </>
            )}
          />
        </View>
        <View style={styles.formContainer}>
          <Controller
            control={control}
            rules={{ required: true, maxLength: 12 }}
            render={({ field }) => (
              <>
                <Text style={[styles.label, errors.gender && styles.error]}>성별</Text>
                <DropDownPicker
                  {...field}
                  listMode="SCROLLVIEW"
                  style={styles.selectBox}
                  dropDownContainerStyle={styles.selectBox}
                  items={selectItems}
                  multiple={false}
                  setValue={cb => {
                    const value = cb(field.value);
                    return field.onChange(value);
                  }}
                  placeholder="선택"
                  open={selectBoxOpen}
                  setOpen={setSelectBoxOpen}
                  onSelectItem={({ value }) => {
                    if (!value) return;
                    setValue('gender', value);
                  }}
                />
              </>
            )}
            name="gender"
          />
        </View>
      </View>
      <Pressable
        style={[styles.button, !isButtonDisabled && { backgroundColor: theme.COLORS.PRIMARY.RED_500 }]}
        disabled={isButtonDisabled}
        onPress={() => {
          navigate('SIGN_UP_AGREEMENT');
        }}
      >
        <Text style={styles.buttonText}>다음</Text>
      </Pressable>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'space-between',
    height: isAos
      ? Dimensions.get('window').height - getStatusBarHeight()
      : Dimensions.get('window').height - getStatusBarHeight() - 34,
  },
  inputSection: {
    gap: 40,
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  default: {
    color: theme.COLORS.GRAY_SCALE.GRAY_600,
  },
  message: {
    paddingVertical: 0,
    fontSize: 12,
  },
  titleWrap: {},
  titleBold: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  titleNormal: {
    fontSize: 28,
    alignItems: 'center',
  },
  formContainer: {
    gap: 12,
  },
  label: {
    fontSize: 14,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: 6,
    borderColor: theme.COLORS.GRAY_SCALE.GRAY_400,
    paddingHorizontal: 16,
    color: theme.COLORS.DEFAULT.BLACK,
  },
  valid: {
    color: theme.COLORS.SECONDARY.BLUE_500,
  },
  error: {
    color: theme.COLORS.PRIMARY.RED_500,
  },
  validBorder: {
    borderColor: theme.COLORS.SECONDARY.BLUE_500,
  },
  errorBorder: {
    borderColor: theme.COLORS.PRIMARY.RED_500,
  },
  selectBox: {
    width: Dimensions.get('window').width / 2 - 24,
    borderColor: theme.COLORS.GRAY_SCALE.GRAY_400,
  },
  button: {
    marginBottom: 32,
    marginHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    height: 56,
    backgroundColor: theme.COLORS.GRAY_SCALE.GRAY_500,
  },
  buttonText: {
    fontSize: 18,
    color: theme.COLORS.DEFAULT.WHITE,
  },
});

export { UserInfo };
