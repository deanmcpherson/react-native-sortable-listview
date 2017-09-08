import 'react-native';
import React from 'react';
import MyComponent from '../example';

// Note: test renderer must be required after react-native.
import renderer from 'react-test-renderer';

jest.mock('InteractionManager');

test('renders correctly', () => {
  const tree = renderer.create(
    <MyComponent />
  ).toJSON();
  expect(tree).toMatchSnapshot();
});
