# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).




## [0.2.9] - 2019-07-28
### Added
- Adapting for web, by neutralizing LayoutAnimation (#145)

### Changed
- Use ListView from deprecated-react-native-listview (#166)

## [0.2.8] - 2018-02-01
### Fixed
- handleLongPress doesn't exist anymore (#138)

## [0.2.7] - 2017-12-14
### Added
- Prop to moveOnPressIn. LongPress delay is eliminated if moveOnPressIn is true.
- Prop to ListViewComponent. A custom ListView component to be used instead of React-Native's ListView.
- Prop to disableAnimatedScrolling. Disable animation when scrolling.

## [0.2.6] - 2017-09-14
### Fixed
- Issue #101

## [0.2.5] - 2017-08-10
### Added
- limitScrolling prop to work around Issue #76

## [0.2.4] - 2017-08-08
### Added
- props to register onRowActive & onMoveCancel handlers

### Fixed
- Unwanted scrolling near top of list (Issue #64)
- Jitter when dragging element to the bottom of the list (also documented as part of #64).

## [0.2.3] - 2017-08-05
### Added
- activeOpacity prop
- CHANGELOG
- CONTRIBUTING section to README.

### Changed
- Coding style changed from es5 to es6 (`React.createClass` to `extends Component`)
- Formatting standardized using [prettier](http://jlongster.com/A-Prettier-Formatter).
- Other minor refactoring.


## [0.2.2] - 2017-03-10

- Last release before Changelog added
